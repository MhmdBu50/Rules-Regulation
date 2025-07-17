//chatbot functionality

        const chatIcon = document.getElementById('chat-icon');
        const chatBox = document.getElementById('chat-box');
        const chatClose = document.getElementById('chat-close');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');


        chatIcon.addEventListener('click', () => {
            chatBox.classList.add('active');
        });


        chatClose.addEventListener('click', () => {
            chatBox.classList.remove('active');
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (message !== '') {

                const userMessage = document.createElement('div');
                userMessage.classList.add('message', 'user-message');
                userMessage.textContent = message;
                chatMessages.appendChild(userMessage);

                messageInput.value = '';

                chatMessages.scrollTop = chatMessages.scrollHeight;

                setTimeout(() => {
                    const botMessage = document.createElement('div');
                    botMessage.classList.add('message', 'bot-message');
                    botMessage.textContent = "Eat kabsa habibi";
                    chatMessages.appendChild(botMessage);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        }

        sendButton.addEventListener('click', sendMessage)
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        //open and close the side nav menu (mobile only)
        const sidebar = document.getElementById('sideNavBar');
        const burgerBtn = document.getElementById('burgerBtn');
        const backdrop = document.getElementById('sidebarBackdrop');

        burgerBtn.addEventListener('click', () => {
            sidebar.classList.remove('d-lg-none'); // force show sidebar
            sidebar.style.display = 'block';
            backdrop.style.display = 'block';
            // Add outside click handler
            setTimeout(() => {
                sidebar.style.width = '250px';
                }, 10);
            });

        backdrop.addEventListener('click', () => {
            sidebar.style.width = '0';               // Start slide-out animation
            backdrop.style.display = 'none';         // Instantly hide the backdrop

            setTimeout(() => {
                sidebar.style.display = 'none';        // Fully hide sidebar after animation
                sidebar.classList.add('d-lg-none');    // Reapply Bootstrap’s mobile-only hiding
            }, 300); // matches the CSS transition duration
            });
        
        //this function helps auto-close the side nav bar
        function closeSidebar() {
            sidebar.style.width = '0';
            backdrop.style.display = 'none';
            setTimeout(() => {
            sidebar.style.display = 'none';
            sidebar.classList.add('d-lg-none');
            }, 300);
        }

        // Watch window size and auto-close if it's large
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992) {
            closeSidebar();
            }
        });

        //filter panel functionality

        document.addEventListener("DOMContentLoaded", function () {
            const button = document.getElementById("filter-button");
            const panel = document.getElementById("filter-panel");

            button.addEventListener("click", function (e) {
                e.stopPropagation();
                panel.classList.toggle("d-none");
            });

            document.addEventListener("click", function (e) {
                if (!panel.contains(e.target) && e.target !== button) {
                    panel.classList.add("d-none");
                }
            });
        });

        // date filter functionality
        document.addEventListener("DOMContentLoaded", function () {
            const radios = document.querySelectorAll('input[name="dateOption"]');
            const dateFields = document.getElementById("dateRangeFields");

            radios.forEach(radio => {
                radio.addEventListener("change", function () {
                    if (this.value === "range") {
                        dateFields.style.display = "block";
                    } else {
                        dateFields.style.display = "none";
                    }
                });
            });
        });

        fitty('.nav-label:not(.history-button) label', {
            minSize: 14,
            maxSize: 16,
            multiLine: true
        });

        fitty('.history-button label', {
            minSize: 12,
            maxSize: 24,
            multiLine: true
        });

        document.querySelectorAll('.bar-button .nav-label label').forEach(el => {
            el.style.setProperty('white-space', 'normal', 'important');
        });

        // looks for template elements by ID in the HTML code
        // if found, clone the content then returns the SVG
        // if not found, return null
        function getSVGFromTemplate(id) {
        const tpl = document.getElementById(id);
        return tpl?.content.cloneNode(true) || null;
        }
        //looks for button/a tags interactions
        //gets the matching normal SVG from the templates section
        //finds the .svg-container div, clears the container
        //then appends the SVG
        function alter(clickedEl) {
        document.querySelectorAll('[data-id]').forEach(el => {
            const id = el.dataset.id;
            const container = el.querySelector('.svg-container');
            const normal = getSVGFromTemplate(`normal-${id}`);
            if (container && normal) {
            container.innerHTML = '';
            container.appendChild(normal);
            }
        });

        //gets the ID of clicked element then finds the 
        //corresponding .svg-container div then loads the altered
        //SVG and replaces the normal SVG with the altered version
        const id = clickedEl.dataset.id;
        const container = clickedEl.querySelector('.svg-container');
        const altered = getSVGFromTemplate(`altered-${id}`);
        if (container && altered) {
            container.innerHTML = '';
            container.appendChild(altered);
        }
        }

        //waits for the HTML to load then goes through all templates IDs
        //then Inserts all the normal/unaltered version of the SVGs
        //into each .svg-container at page load
        document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-id]').forEach(el => {
            const id = el.dataset.id;
            const container = el.querySelector('.svg-container');
            const normal = getSVGFromTemplate(`normal-${id}`);
            if (container && normal) {
            container.appendChild(normal);
            }
        });
        });