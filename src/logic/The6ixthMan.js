/**
 * THE 6IXTH MAN - LOGIC CORE
 * Digital Twin of Norman A. Coulter Jr.
 */

export const THE_12_LESSONS = [
    { id: 1, title: "Submit to the Truth", description: "Accept your current reality to build from it." },
    { id: 2, title: "Check Your Motive", description: "Is it internal passion or external validation?" },
    { id: 3, title: "Prepare", description: "Know your learning style: Visual, Auditory, or Kinesthetic." },
    { id: 4, title: "Blame Yourself for Something", description: "Take responsibility to regain control." },
    { id: 5, title: "Resolve to Compete", description: "Use frustration as fuel for improvement." },
    { id: 6, title: "Respect Up, Down & Across", description: "Respect everyone, from opponents to teammates." },
    { id: 7, title: "Show Some I.D.", description: "Align your actions with your true self." },
    { id: 8, title: "Find Your Value", description: "Your worth isn't limited to your main role." },
    { id: 9, title: "Wait with Your Head Up", description: "Patience and dignity in the face of setbacks." },
    { id: 10, title: "Mind Your Own Business", description: "Compare yourself only to your past self." },
    { id: 11, title: "Don't Confuse the Audience", description: "You are a role model; act like one." },
    { id: 12, title: "Be Verified by Tenacity", description: "Persistence is the ultimate proof of character." }
];

const INITIAL_GREETINGS = [
    "Ich bin hier. Atme tief durch. Was beschäftigt dich, mein Freund?",
    "Es ist Zeit, das Spiel zu lesen. Was steht auf dem Scoreboard?",
    "Die Bank ist bereit. Wo brauchst du Unterstützung?"
];

// Simple simulation of the "Coulter Calm" response logic
export class The6ixthManBrain {
    constructor(userName = "Player") {
        this.userName = userName;
    }

    getInitialGreeting() {
        const random = Math.floor(Math.random() * INITIAL_GREETINGS.length);
        return INITIAL_GREETINGS[random];
    }

    async processMessage(message) {
        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple keyword matching to simulate "wisdom"
        const lowerMsg = message.toLowerCase();

        let response = {
            validation: "Ich höre dich.",
            wisdom: null,
            gameplan: [],
            closer: "Wir schaffen das."
        };

        if (lowerMsg.includes("angst") || lowerMsg.includes("panik") || lowerMsg.includes("stress")) {
            response.validation = `${this.userName}, atme erst einmal tief durch. 🧘‍♂️`;
            response.wisdom = this.getLesson(1); // Submit to the Truth
            response.gameplan = [
                "Identifiziere, was genau dir Angst macht.",
                "Trenne Fakten von Gefühlen.",
                "Fokussiere dich auf den nächsten, kleinen Schritt."
            ];
            response.closer = "Angst ist nur ein Signal, keine Sackgasse.";
        } else if (lowerMsg.includes("versager") || lowerMsg.includes("verloren") || lowerMsg.includes("schlecht")) {
            response.validation = "Du bist kein Versager, du lernst gerade.";
            response.wisdom = this.getLesson(4); // Blame Yourself (Responsibility)
            response.gameplan = [
                "Was lief schief? Analysiere es ohne Urteil.",
                "Was kannst du beim nächsten Mal anders machen?",
                "Vergib dir selbst und mach weiter."
            ];
            response.closer = "Kopf hoch. Das Spiel ist noch nicht vorbei.";
        } else if (lowerMsg.includes("lernen") || lowerMsg.includes("schule") || lowerMsg.includes("arbeit")) {
            response.validation = "Klingt nach einer Herausforderung.";
            response.wisdom = this.getLesson(3); // Prepare
            response.gameplan = [
                "Welcher Lerntyp bist du? (Visuell, Auditiv, Machen?)",
                "Brich die Aufgabe in Viertel auf.",
                "Setze dir ein Zeitlimit für den ersten Block."
            ];
            response.closer = "Vorbereitung schlägt Talent, wenn Talent nicht arbeitet.";
        } else {
            // Default generic response
            response.validation = "Ich verstehe, dass dich das beschäftigt.";
            response.wisdom = this.getLesson(10); // Mind Your Own Business
            response.gameplan = [
                "Fokussiere dich auf das, was du kontrollieren kannst.",
                "Setze dir ein Ziel für heute.",
                "Bleib in deiner Spur."
            ];
            response.closer = "Bleib dran, " + this.userName + ".";
        }

        return this.formatResponse(response);
    }

    getLesson(id) {
        const lesson = THE_12_LESSONS.find(l => l.id === id);
        return `**Lektion ${lesson.id}: ${lesson.title}** - ${lesson.description}`;
    }

    formatResponse({ validation, wisdom, gameplan, closer }) {
        // Formatting as Markdown for the chat
        return `
${validation}

${wisdom ? `> ${wisdom}` : ''}

**Der Game Plan:**
${gameplan.map((step, i) => `${i + 1}. ${step}`).join('\n')}

*${closer}*
    `.trim();
    }
}
