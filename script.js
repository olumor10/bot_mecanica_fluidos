import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyBGNF_i0BWIi4xxy93CSHXNdaxG6R-2W9E';
const MODEL_NAME = 'gemini-2.0-pro-exp-02-05';
const genAI = new GoogleGenerativeAI(API_KEY);

// Variável global para a imagem colada
let pastedImage = null;

// Função auxiliar para converter arquivo em base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // remover prefixo "data:*/*;base64,"
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Event listener para colar imagem via Ctrl+V
document.addEventListener('paste', function (e) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            pastedImage = items[i].getAsFile();
            // Marcar o ícone como ativo
            const uploadIcon = document.querySelector("label[for='imageInput']");
            uploadIcon.classList.add("active");
            // Evita o comportamento padrão, se necessário
            e.preventDefault();
            break;
        }
    }
});

window.resolveQuestion = async function () {
    const question = document.getElementById('question').value;
    const imageInput = document.getElementById('imageInput');
    const answerField = document.getElementById('answer');
    answerField.innerHTML = "Processando...";
    console.log("Pergunta:", question);

    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: "Você é o MecFlu, um assistente que resolve questões sobre análise dimencional e semelhança, que é uma assunto de mecânica dos fluidos. Você não deve formatar a equações na resposta em LaTeX. Se a pergunta for sobre uma imagem em anexo, e não haver imagem anexada, você deve responder que não é possível responder a pergunta sem a imagem.",
        });

        let input;
        // Prioriza o arquivo selecionado; se não houver, verifica a imagem colada
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            const base64Data = await fileToBase64(file);
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            };
            input = [question, imagePart];
        } else if (pastedImage) {
            const base64Data = await fileToBase64(pastedImage);
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: pastedImage.type,
                },
            };
            input = [question, imagePart];
        } else {
            input = question;
        }

        const result = await model.generateContent(input);
        const response = await result.response;
        const text = await response.text();
        console.log("Resposta:", text);
        answerField.innerHTML = marked.parse(text);
    } catch (error) {
        answerField.innerHTML = "Ocorreu um erro ao obter a resposta. Por favor, tente novamente.";
        console.error("Erro ao gerar resposta:", error);
    }
};

window.clearFields = function () {
    document.getElementById('question').value = '';
    document.getElementById('answer').innerHTML = '';
    document.getElementById('imageInput').value = '';
    pastedImage = null; // Limpa a imagem colada
    const uploadIcon = document.querySelector("label[for='imageInput']");
    uploadIcon.classList.remove("active");
};

document.getElementById('imageInput').addEventListener('change', function () {
    const uploadIcon = document.querySelector("label[for='imageInput']");
    if (this.files && this.files.length > 0) {
        uploadIcon.classList.add("active");
    } else {
        uploadIcon.classList.remove("active");
    }
});

document.getElementById('model-info').textContent = `Modelo: ${MODEL_NAME}`;

// Código do efeito matrix
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array.from({ length: columns }).fill(1);

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#007acc';
    ctx.font = `${fontSize}px arial`;
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(draw, 33);
