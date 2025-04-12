
function cloneAnswerBlock() {
  const output = document.querySelector("#gpt-output");
  const template = document.querySelector("#chat-template");
  const clone = template.content.cloneNode(true);
  output.appendChild(clone);
  return output.lastElementChild.querySelector(".message");
}

function addToLog(message) {
  const block = cloneAnswerBlock();
  if (!block) return null;
  block.innerText = message;
  return block;
}



function getChatHistory() {
  const messages = document.querySelectorAll("#gpt-output .message");
  return Array.from(messages).map(msg => msg.textContent);
}



async function fetchPromptResponse(prompt) {
  // Simulation d'une réponse
  const fakeResponse = `**Réponse GPT :** Voici une réponse générée à partir de "${prompt}".\n\n\`\`\`js\nconsole.log("Hello world");\n\`\`\``;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < fakeResponse.length) {
          controller.enqueue(encoder.encode(fakeResponse[i]));
          i++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 10);
    }
  });
  return stream.getReader();
}

async function readResponseChunks(reader, gptOutput) {
  const decoder = new TextDecoder();
  const converter = new showdown.Converter();
  let chunks = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks += decoder.decode(value);
    gptOutput.innerHTML = converter.makeHtml(chunks);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#prompt-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = form.elements.prompt.value;
    if (!prompt.trim()) return;

    addToLog(prompt);
    const gptOutput = addToLog("GPT réfléchit...");

    try {
      const reader = await fetchPromptResponse(prompt);
      await readResponseChunks(reader, gptOutput);
    } catch (err) {
      gptOutput.innerText = "Erreur de réponse 😢";
      console.error(err);
    } finally {
      hljs.highlightAll();
    }
  });
});