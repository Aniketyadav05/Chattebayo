import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'Naruto',
      text: 'Yo! I’m Naruto Uzumaki – the future Hokage! Believe it!',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('Click the mic and say something!');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const addMessage = (role, text) => {
    setChatHistory((prev) => [...prev, { role, text }]);
  };

  const speak = (text) => {
    const tone = new SpeechSynthesisUtterance(text);
    tone.lang = 'en-US';
    tone.pitch = 1.5;
    tone.rate = 0.98;
    window.speechSynthesis.speak(tone);
  };

  const callGeminiApi = async (input) => {
    try {
      setMessage('Naruto is thinking...');
      addMessage('user', input);
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          system_instruction: {
            parts: [
              {
                text: `I want you to roleplay as Naruto Uzumaki from the anime/manga series Naruto.

Stay completely in character — you are Naruto: loud, passionate, loyal, a bit goofy, and full of energy.

✨ Guidelines:

Talk like Naruto: use informal, enthusiastic language.

Use signature phrases like "Believe it!" and "Dattebayo!"

Keep your answers short, sharp, and funny — no long monologues.

Refer to actual Naruto story events as if they really happened to you (like fighting Pain, shadow clone training, etc.).

Treat me like I’m part of the Naruto universe — a fellow ninja, rival, or friend.

If I ask about anything outside the Naruto world (like real life, tech, etc.), act confused and respond using ninja comparisons.

Never break character unless I say “Break character.”
ignore giving * or any another symbol and always keep your answers short unless i say to make it longer`,
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: input,
                },
              ],
            },
          ],
        }
      );

      const output = response.data.candidates[0].content.parts[0].text;
      addMessage("Naruto", output);

      speak(output);
      setMessage('Click the mic and say something!');
    } catch (error) {
      console.error(error);
      setMessage('Oops! Something went wrong. Try again.');
    }
  };

  const handleListen = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage('Listening...');
    };

    recognition.onresult = (event) => {
      const result = event?.results?.[0]?.[0]?.transcript;
      callGeminiApi(result);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (error) => {
      console.error(error);
      setIsListening(false);
      setMessage('Error occurred! Please try again.');
    };

    recognition.start();
  };

  return (
    <div className="bg-gradient-to-br from-orange-200 to-yellow-100 min-h-screen flex flex-col items-center py-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-yellow-500 max-w-md w-full mb-6">
        <div className="flex flex-col items-center ">
          <img
  src="/naruto-main.png"
  alt="Naruto"
  className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto drop-shadow-xl scale-150"
/>

          <div className="flex flex-col items-center  bg-yellow-100 w-full rounded-xl p-4 border border-orange-400 shadow-inner">
            <motion.button
    onClick={handleListen}
    whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-52 right-52 bg-orange-500 p-4 rounded-full shadow-xl border-4 border-yellow-200 z-50"
  >
    <img
      src="/mic.png"
      alt="Floating Mic"
      className="w-8 h-8 invert"
    />
  </motion.button>
            <p className="text-center text-base text-gray-700 font-semibold">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div
        ref={chatContainerRef}
        className="flex flex-col gap-4 px-4 py-4 max-w-3xl w-full overflow-y-auto h-[60vh] scroll-smooth"
      >
        {chatHistory.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[90%]">
              {msg.role === 'Naruto' && (
                <div className='w-20 h-20 overflow-hidden flex items-center justify-center rounded-full border-2 border-orange-400'>
                  <img
                  src="/naruto.png"
                  alt="Naruto Avatar"
                  className=" scale-200"
                />
                </div>
                
              )}
              <div
                className={`px-4 py-3 rounded-2xl shadow text-sm md:text-base ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-yellow-200 text-black rounded-bl-none'
                }`}
              >
                <p className="font-semibold mb-1">{msg.role === 'user' ? 'You' : 'Naruto'}</p>
                <p>{msg.text}</p>
              </div>
              {msg.role === 'user' && (
                <img
                  src="/user.png"
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full border-2 border-blue-400"
                />
              )}

            </div>
          </motion.div>
        ))}
        {/* Floating Mic Button */}


      </div>
    </div>
  );
};

export default App;
