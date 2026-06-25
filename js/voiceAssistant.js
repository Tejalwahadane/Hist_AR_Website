class VoiceAssistant {
    constructor(config) {
        this.monument = config.monument;
        this.apiUrl = config.apiUrl || "https://hist-ar-api.onrender.com/chat";

        this.isListening = false;
        this.isSpeaking = false;

        this.micButton = document.getElementById("aiMicBtn");
        this.stopButton = document.getElementById("stopAiBtn");
        this.questionBox = document.getElementById("userQuestion");
        this.answerBox = document.getElementById("aiAnswer");
        this.statusBox = document.getElementById("aiStatus");

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition is not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();

        this.recognition.lang = "en-IN";
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.bindEvents();
    }

    bindEvents() {

        this.micButton.addEventListener("click", () => {

            if (this.isListening)
                return;

            this.startListening();

        });

        this.stopButton.addEventListener("click", () => {

            window.speechSynthesis.cancel();

            this.statusBox.innerHTML = "Stopped.";

            this.isSpeaking = false;

        });

        this.recognition.onresult = (event) => {

            const text =
                event.results[0][0].transcript;

            this.questionBox.innerHTML = text;

            this.sendToAI(text);

        };

        this.recognition.onerror = (event) => {

            this.statusBox.innerHTML =
                "Microphone Error : " + event.error;

            this.isListening = false;

            this.micButton.disabled = false;

        };

        this.recognition.onend = () => {

            this.isListening = false;

            this.micButton.disabled = false;

        };

    }

    startListening() {

        this.isListening = true;

        this.micButton.disabled = true;

        this.statusBox.innerHTML = "🎤 Listening...";

        this.answerBox.innerHTML = "";

        this.recognition.start();

    }

    async sendToAI(question) {

        this.statusBox.innerHTML = "🤖 Thinking...";

        try {

            const response = await fetch(this.apiUrl, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    message: question,

                    monument: this.monument

                })

            });

            const data = await response.json();

            this.answerBox.innerHTML = data.reply;

            this.statusBox.innerHTML = "✅ Ready";

            this.speak(data.reply);

        }

        catch (error) {

            console.error(error);

            this.statusBox.innerHTML =
                "Unable to connect to AI.";

        }

    }

    speak(text) {

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-IN";

        speech.rate = 1;

        speech.pitch = 1;

        speech.onstart = () => {

            this.isSpeaking = true;

        };

        speech.onend = () => {

            this.isSpeaking = false;

        };

        window.speechSynthesis.speak(speech);

    }

}
