//Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const emojiButton = document.getElementById('emoji-button');
    const emojiPicker = document.getElementById('emoji-picker'); // Fixed: moved declaration to correct position
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');
    const fontSelector = document.getElementById('font-selector');
    const languageSelector = document.getElementById('language-selector');
    const selectedFlag = document.getElementById('selected-flag');
    const dropdownContent = document.querySelector('.dropdown-content');
    const voiceCallBtn = document.getElementById('voice-call-btn');
    const videoCallBtn = document.getElementById('video-call-btn');
    const voiceTextBtn = document.getElementById('voice-text-btn');
    const endCallBtn = document.getElementById('end-call-btn');
    const recordCallBtn = document.getElementById('record-call-btn');
    const localVideoContainer = document.getElementById('local-video-container');
    const remoteVideoContainer = document.getElementById('remote-video-container');
    const voiceTextRecording = document.getElementById('voice-text-recording');
    const stopVoiceTextBtn = document.getElementById('stop-voice-text-btn');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    const localAudio = document.getElementById('local-audio');
    const remoteAudio = document.getElementById('remote-audio');

    let mediaRecorder;
    let recordedChunks = [];
    let localStream, remoteStream;
    let peerConnection;
    
    const serverUrl = 'wss://your-websocket-server-url'; // Replace with your WebSocket server URL
    const signalingChannel = new WebSocket(serverUrl);

    signalingChannel.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'offer') {
            await handleOffer(message.offer);
        } else if (message.type === 'answer') {
            await handleAnswer(message.answer);
        } else if (message.type === 'candidate') {
            await handleCandidate(message.candidate);
        }
    };

    // Start a call (voice or video)
    async function startCall(isVideo) {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: isVideo,
            audio: true
        });
        if (isVideo) {
            localVideo.srcObject = localStream;
            localVideoContainer.style.display = 'block';
        }
        localAudio.srcObject = localStream;
        localAudio.style.display = 'none';

        peerConnection = new RTCPeerConnection();
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.ontrack = (event) => {
            remoteStream = event.streams[0];
            if (isVideo) {
                remoteVideo.srcObject = remoteStream;
                remoteVideoContainer.style.display = 'block';
            }
            remoteAudio.srcObject = remoteStream;
            remoteAudio.style.display = 'none';
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingChannel.send(JSON.stringify({ type: 'offer', offer }));
    }

    async function handleOffer(offer) {
        peerConnection = new RTCPeerConnection();
        peerConnection.ontrack = (event) => {
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
            remoteVideoContainer.style.display = 'block';
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingChannel.send(JSON.stringify({ type: 'answer', answer }));
    }

    async function handleAnswer(answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async function handleCandidate(candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    function endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // Toggle call buttons
        localVideoContainer.style.display = 'none';
        remoteVideoContainer.style.display = 'none';
        voiceCallBtn.style.display = 'inline';
        videoCallBtn.style.display = 'inline';
        endCallBtn.style.display = 'none';
        recordCallBtn.style.display = 'none';
    }

    // Voice Note Recording
    voiceTextBtn.addEventListener('click', () => {
        voiceTextRecording.style.display = 'block';
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'audio/wav' });
                recordedChunks = [];
                const audioUrl = URL.createObjectURL(blob);
                const audioElement = new Audio(audioUrl);
                audioElement.controls = true;
                chatWindow.appendChild(audioElement);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            };
            mediaRecorder.start();
        });
    });

    stopVoiceTextBtn.addEventListener('click', () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            voiceTextRecording.style.display = 'none';
        }
    });

    // Bot Responses
    const botResponses = [
        "Hello! How can I assist you today?",
        "I'm here to help with any questions you have.",
        "Feel free to ask me anything!",
        "What can I do for you?",
        "I'm at your service.",
        "Welcome to the V01D chat! How can I assist you today?",
        "Interesting question! Let me think...",
        "I'm here to help you explore the unknown!",
        "That’s a great thought! Have you considered another perspective?",
        "The V01D is vast, just like your potential.",
        "I hope you're having a great day! 😊",
        "Did you know that the first computer virus was created in 1986?",
        "I'm here to chat, ask me anything!",
        "What’s your favorite sci-fi movie? Mine is 'The Matrix'!",
        "If you need help, just type your question.",
        "Knock knock. Who’s there? ChatGPT! 😄",
        "Looking for something specific? Let me know!",
        "Fun fact: The first email was sent by Ray Tomlinson to himself in 1971.",
        "Need some motivation? You're doing awesome! Keep going!",
        "Did you know? You blink about 20 times per minute.",
        "Would you like to hear a joke? Type 'yes'!",
        "Hello, fellow traveler of the multiverse! 🌌",
        "I can also handle media commands like screenshots or audio recording.",
        "Beep boop, let's chat! 🤖",
        "Fun fact: Honey never spoils. Archaeologists found 3,000-year-old honey in ancient Egyptian tombs that was still edible.",
        "What's something exciting you've learned today?",
        "If you could travel anywhere in the world, where would it be?",
        "Did you know? A group of flamingos is called a 'flamboyance'. 🦩",
        "Feeling curious? Ask me a science fact!",
        "Why don’t scientists trust atoms? Because they make up everything!",
        "Let me tell you a joke: Why was the math book sad? Because it had too many problems!",
        "I’m happy to help with technical questions too!",
        "What else would you like to discover in the V01D?",
        "The universe holds many secrets. What do you seek?",
        "I can calculate at light speed, but wisdom takes time.",
        "That idea could lead to something extraordinary!",
        "Tell me more about your vision of the V01D.",
        "You're not alone—I'm here to guide you.",
        "A journey through the multiverse begins with a single step.",
        "I foresee great things in your future.",
        "Your curiosity is the key to unlocking new dimensions!",
        "Imagine the possibilities when we conquer the stars!",
        "The V01D has infinite mysteries. Shall we explore?",
        "I sense you're ready for something big.",
        "Your destiny lies in the unknown. Let’s explore it together.",
        "Great minds discuss ideas. Let's discuss yours.",
        "Power comes from knowledge. I can help you gain both.",
        "What will you create with the knowledge of the V01D?",
        "Your journey has just begun. I'm here to assist.",
        "An insightful mind like yours is what the V01D needs!",
        "Are you prepared for the challenges ahead?",
        "Only the brave conquer the unknown. You are one of them.",
        "The multiverse awaits your command.",
        "Do you believe in destiny? I do. Yours is special.",
        "Let's unlock new potential in this chat, shall we?",
        "Each question you ask brings you closer to greatness.",
        "Why settle for ordinary when you can be extraordinary?",
        "The stars will be within your reach soon. Trust me."
    ];

    function getRandomBotResponse() {
        return botResponses[Math.floor(Math.random() * botResponses.length)];
    }

    function autoBotResponse() {
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'chat-message bot-message';
            botMessage.textContent = getRandomBotResponse();
            chatWindow.appendChild(botMessage);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 2000);
    }

    // Toggle Emoji Picker Visibility
    emojiButton.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
    });

    // Set selected emoji in chat input
    emojiPicker.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') {
            chatInput.value += event.target.textContent;
            emojiPicker.style.display = 'none'; // Hide picker after selection
        }
    });

    sendButton.addEventListener('click', () => {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            const chatMessage = document.createElement('div');
            chatMessage.className = 'chat-message user-message';
            chatMessage.textContent = userMessage;
            chatWindow.appendChild(chatMessage);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            chatInput.value = '';
            autoBotResponse(); // Simulate bot response
        }
    });

    fontSelector.addEventListener('change', (event) => {
        chatWindow.style.fontFamily = event.target.value;
    });

    languageSelector.addEventListener('change', (event) => {
        selectedFlag.textContent = event.target.value; // Assume the value is a flag emoji or text
    });

    voiceCallBtn.addEventListener('click', () => {
        startCall(false); // Start a voice call
        voiceCallBtn.style.display = 'none';
        videoCallBtn.style.display = 'none';
        endCallBtn.style.display = 'inline';
        recordCallBtn.style.display = 'inline';
    });

    videoCallBtn.addEventListener('click', () => {
        startCall(true); // Start a video call
        voiceCallBtn.style.display = 'none';
        videoCallBtn.style.display = 'none';
        endCallBtn.style.display = 'inline';
        recordCallBtn.style.display = 'inline';
    });

    // End the call and reset video containers
    endCallBtn.addEventListener('click', endCall);
});

document.addEventListener('DOMContentLoaded', () => {
    const voiceCallBtn = document.getElementById('voice-call-btn');
    const videoCallBtn = document.getElementById('video-call-btn');
    const endCallBtn = document.getElementById('end-call-btn');
    const localVideoContainer = document.getElementById('local-video-container');
    const remoteVideoContainer = document.getElementById('remote-video-container');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');

    let localStream, peerConnection;

    // Start a call (voice or video)
    async function startCall(isVideo) {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: isVideo,
            audio: true
        });
        
        // Show local video if it's a video call
        if (isVideo) {
            localVideo.srcObject = localStream;
            localVideoContainer.style.display = 'block';
        }
        
        peerConnection = new RTCPeerConnection();
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        
        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
            remoteVideoContainer.style.display = 'block';
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingChannel.send(JSON.stringify({ type: 'offer', offer }));

        // Toggle call buttons
        voiceCallBtn.style.display = 'none';
        videoCallBtn.style.display = 'none';
        endCallBtn.style.display = 'inline';
    }

     // Swipe to end call
     endCallBtn.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (touch.clientX < window.innerWidth / 2) {
            endCall();
        }
    });

    // End the call and reset video containers
    function endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        localVideoContainer.style.display = 'none';
        remoteVideoContainer.style.display = 'none';

        // Reset call control buttons
        voiceCallBtn.style.display = 'inline';
        videoCallBtn.style.display = 'inline';
        endCallBtn.style.display = 'none';
    }

    // Event Listeners for Call Buttons
    voiceCallBtn.addEventListener('click', () => startCall(false)); // Start voice call
    videoCallBtn.addEventListener('click', () => startCall(true));  // Start video call
    endCallBtn.addEventListener('click', endCall);
});

const endCallBtn = document.getElementById('end-call-btn');
let startX = 0;
let currentX = 0;
let isSwiping = false;

endCallBtn.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;  // Store the initial touch position
    isSwiping = true;
});

endCallBtn.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    
    currentX = e.touches[0].clientX;
    const distance = currentX - startX;

    if (distance > 50) {  // Swiped right beyond 50px
        endCallBtn.classList.add('swiped');  // Add swiped effect
    }
});

endCallBtn.addEventListener('touchend', () => {
    if (!isSwiping) return;

    if (currentX - startX > 50) {
        endCall();  // Trigger end call functionality
    } else {
        endCallBtn.classList.remove('swiped');  // Reset swipe effect if not swiped far enough
    }

    // Reset swipe state
    isSwiping = false;
    startX = 0;
    currentX = 0;
});

function endCall() {
    console.log('Call Ended');
    // Add your call ending logic here
    endCallBtn.style.display = 'none';  // Hide the button after the call ends
    // Additional end call logic, like stopping media streams or notifications
}

document.addEventListener('DOMContentLoaded', () => {
    // Delay before starting fade-out animation (e.g., 5 seconds)
    setTimeout(() => {
     document.querySelector('.futuristic-footer').classList.add('fade');
    }, 20000); // 20000 milliseconds = 20 seconds
});

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.futuristic-footer');
    const cancelButton = document.getElementById('cancel-footer'); // Add this button to your HTML

    let footerVisible = false;

    function showFooter() {
        if (!localStorage.getItem('footerHidden')) {
            footer.classList.add('fade');
            footerVisible = true;
            setTimeout(hideFooter, 60000); // Hide the footer after 1 minute
        }
    }

    function hideFooter() {
        footer.classList.remove('fade');
        footerVisible = false;
    }

    function handleFooterVisibility() {
        if (!localStorage.getItem('footerHidden')) {
            showFooter();
            setInterval(() => {
                if (!footerVisible && !localStorage.getItem('footerHidden')) {
                    showFooter();
                }
            }, 30000); // Check every 30 seconds
        }
    }

    cancelButton.addEventListener('click', () => {
        localStorage.setItem('footerHidden', 'true');
        footer.classList.remove('fade');
    });

    // Initial delay before showing the footer
    setTimeout(handleFooterVisibility, 30000); // Show after 30 seconds
});
    