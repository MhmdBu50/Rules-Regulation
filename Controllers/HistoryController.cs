using Microsoft.AspNetCore.Mvc;
using RulesRegulation.Services;

namespace RulesRegulation.Controllers
{
    public class HistoryController : Controller
    {
        private readonly OracleDbService _dbService;

        public HistoryController(OracleDbService dbService)
        {
            _dbService = dbService;
        }

        [HttpGet]
        public IActionResult GetUserHistory()
        {
            try
            {
                string query = @"SELECT h.ID, h.USER_ID, h.RECORD_ID, h.ACTION, h.ACTION_DATE, r.REGULATION_NAME, r.REGULATION_NAME_AR
                               FROM USER_HISTORY h
                               LEFT JOIN RECORDS r ON h.RECORD_ID = r.RECORD_ID
                               ORDER BY h.ACTION_DATE DESC";
                
                var historyData = _dbService.GetData(query);
                var historyList = new List<object>();

                foreach (System.Data.DataRow row in historyData.Rows)
                {
                    historyList.Add(new
                    {
                        Id = Convert.ToInt32(row["ID"]),
                        UserId = row["USER_ID"]?.ToString(),
                        RecordId = Convert.ToInt32(row["RECORD_ID"]),
                        RecordName = row["REGULATION_NAME"]?.ToString() ?? "Unknown Record",
                        RegulationNameAr = row["REGULATION_NAME_AR"]?.ToString(),
                        Action = row["ACTION"]?.ToString(),
                        ActionDate = row["ACTION_DATE"]
                    });
                }

                return Json(historyList);
            }
            catch (Exception)
            {
                return Json(new List<object>());
            }
        }

        [HttpPost]
        public IActionResult RecordAction([FromBody] RecordActionRequest request)
        {
            try
            {
                string userIdValue = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                
                string query = $"INSERT INTO USER_HISTORY (USER_ID, RECORD_ID, ACTION, ACTION_DATE) VALUES ('{userIdValue}', {request.RecordId}, '{request.Action}', CURRENT_TIMESTAMP)";
                
                var result = _dbService.GetData($"BEGIN {query}; COMMIT; END;");
                return Json(new { success = true });
            }
            catch (Exception)
            {
                return Json(new { success = false });
            }
        }

        [HttpPost]
        public IActionResult DeleteHistoryItem([FromBody] DeleteHistoryRequest request)
        {
            try
            {
                string query = $"BEGIN DELETE FROM USER_HISTORY WHERE ID = {request.HistoryId}; COMMIT; END;";
                var result = _dbService.GetData(query);
                return Json(new { success = true });
            }
            catch (Exception)
            {
                return Json(new { success = false });
            }
        }
    }

    public class RecordActionRequest
    {
        public int RecordId { get; set; }
        public string Action { get; set; } = "";
    }

    public class DeleteHistoryRequest
    {
        public int HistoryId { get; set; }
    }
}