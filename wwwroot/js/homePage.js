

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
        /*        // Fitty.js for responsive text sizing
        fitty('.nav-label:not(.history-button) label', {
            minSize: 14,
            maxSize: 18,
            multiLine: true
        });
        */

        fitty('.history-button label', {
            minSize: 12,
            maxSize: 24,
            multiLine: true
        });

        document.querySelectorAll('.bar-button .nav-label label').forEach(el => {
            el.style.setProperty('white-space', 'normal', 'important');
        });

//  Safe SVG loader using innerHTML
    function getSVGFromTemplate(id) {
        const tpl = document.getElementById(id);
        if (!tpl) return null;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = tpl.innerHTML.trim();
        return wrapper.firstElementChild;
    }

    //  Replace .svg-container with normal version from template
    function initIcons(selector) {
        document.querySelectorAll(selector).forEach(container => {
            const parent = container.closest('[data-id]');
            if (!parent) return;

            const dataId = parent.getAttribute('data-id');
            const svg = getSVGFromTemplate(`normal-${dataId}`);
            if (svg) {
                container.innerHTML = '';  // clean existing
                container.appendChild(svg);
            }
        });
    }

    //  Toggle between normal and altered SVGs when clicked
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

        const id = clickedEl.dataset.id;
        const container = clickedEl.querySelector('.svg-container');
        const altered = getSVGFromTemplate(`altered-${id}`);
        if (container && altered) {
            container.innerHTML = '';
            container.appendChild(altered);
        }
    }

    //  Wait until DOM is fully loaded, then run once
    document.addEventListener('DOMContentLoaded', () => {
        initIcons('.navigation-bar .svg-container');
        initIcons('#sideNavBar .svg-container');
    });


