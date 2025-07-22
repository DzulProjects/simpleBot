// Dapatkan referensi ke elemen HTML
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Ganti dengan URL Webhook n8n Anda yang sebenarnya
// Pastikan webhook Anda di n8n diatur untuk menerima POST request dan mengembalikan JSON dengan kunci 'reply'.
const N8N_WEBHOOK_URL = 'https://n8ncontabo.duckdns.org/webhook-test/0cc38c2b-c36c-4401-bb1f-34836aa3e065'; // <-- PENTING: GANTI INI!

/**
 * Menambahkan pesan ke kotak chat.
 * @param {string} sender - Pengirim pesan ('user' atau 'bot').
 * @param {string} text - Teks pesan.
 */
function appendMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'p-3', 'rounded-xl', 'max-w-[80%]', 'break-words', 'shadow-sm');

    if (sender === 'user') {
        messageElement.classList.add('bg-blue-500', 'text-white', 'ml-auto', 'rounded-br-none');
    } else {
        messageElement.classList.add('bg-gray-200', 'text-gray-800', 'mr-auto', 'rounded-bl-none');
    }
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);

    // Gulir ke bawah agar pesan terbaru selalu terlihat
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Mengirim pesan pengguna ke webhook n8n dan menampilkan respons bot.
 * @param {string} message - Pesan yang dikirim oleh pengguna.
 */
async function sendMessageToN8n(message) {
    // Tampilkan pesan pengguna di chat box
    appendMessage('user', message);
    userInput.value = ''; // Kosongkan input setelah dikirim

    // Tampilkan indikator 'Bot sedang mengetik...'
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.classList.add('message', 'bot-message', 'bg-gray-200', 'text-gray-600', 'p-3', 'rounded-xl', 'max-w-[80%]', 'mr-auto', 'rounded-bl-none', 'animate-pulse');
    typingIndicator.textContent = 'Bot sedang mengkaji...';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight; // Gulir ke bawah untuk melihat indikator

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message }) // Kirim pesan sebagai objek JSON
        });

        // Hapus indikator 'Bot sedang mengetik...'
        if (typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }

        if (!response.ok) {
            // Tangani error HTTP (misalnya, 404, 500)
            throw new Error(`Error HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        // Asumsi n8n mengembalikan JSON dengan kunci 'reply' yang berisi respons dari Gemini
        const botReply = data.reply || "Maaf, bot ni sedang jem.";
        appendMessage('bot', botReply);

    } catch (error) {
        // Hapus indikator 'Bot sedang mengetik...' jika terjadi error sebelum respons diterima
        if (typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }
        console.error('Kesalahan mengirim pesan ke n8n:', error);
        appendMessage('bot', 'Maaf, terjadi masalah connction ke server.');
    }
}

// Event listener untuk tombol 'Kirim'
sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        sendMessageToN8n(message);
    }
});

// Event listener untuk tombol 'Enter' pada input teks
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const message = userInput.value.trim();
        if (message) {
            sendMessageToN8n(message);
        }
    }
});

// Pesan sambutan awal saat halaman dimuat
window.onload = () => {
    appendMessage('bot', 'Haiii, apa saya boleh bantu ni?');
};
