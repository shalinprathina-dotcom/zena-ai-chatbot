import { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";
import robot from "./assets/robot.png";

const API_BASE = "http://127.0.0.1:5000";

const INITIAL_MESSAGE = {
  sender: "bot",
  text:
    "Hi 👋 I am ZeNA\nWelcome to ZeAI Soft! 🚀\n\nI'm here to help you explore our services, programs, and more.\n\nHow can I help you today?",
};

function Chatbot() {

  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [chat, setChat] = useState([INITIAL_MESSAGE]);
  const [sessionId, setSessionId] = useState(null);


  // Create chatbot session when component loads
  useEffect(() => {

    axios
      .post(`${API_BASE}/api/chat/start`)
      .then((res) => {

        setSessionId(res.data.session_id);

        setChat([
          {
            sender: "bot",
            text: res.data.message || INITIAL_MESSAGE.text,
          },
        ]);

      })
      .catch((error) => {

        console.log(error);

        setChat([
          {
            sender: "bot",
            text: "Unable to connect to ZeNA.",
          },
        ]);

      });

  }, []);



  const sendMessage = async (text) => {

    let msg = text || message;

    if (!msg.trim()) return;


    setChat((prev) => [
      ...prev,
      {
        sender: "user",
        text: msg,
      },
    ]);


    try {

      const res = await axios.post(
        `${API_BASE}/api/chat`,
        {
          message: msg,
          session_id: sessionId,
        }
      );


      setChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            res.data.message ||
            res.data.response ||
            "No response received",
        },
      ]);


    } catch (error) {

      console.log(error);

      setChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Server connection error",
        },
      ]);

    }


    setMessage("");

  };



  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }

  };



  const handleMinimize = () => {
    setIsMinimized(true);
  };


  const handleRestore = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };


  const handleClose = () => {

    setChat([INITIAL_MESSAGE]);
    setMessage("");
    setIsOpen(false);
    setIsMinimized(false);

  };


  const handleFloatingClick = () => {

    if (isMinimized) {
      handleRestore();
    } 
    else {
      setIsOpen(true);
    }

  };



  return (

    <>

      {isOpen && !isMinimized && (

        <div className="chat-window">


          <div className="chat-header">


            <div className="profile">

              <img src={robot} alt="ZeNA" />


              <div>
                <h3>ZeNA</h3>
                <p>ZeAI Soft Assistant</p>
              </div>

            </div>



            <div className="actions">

              <button
                className="minimize-btn"
                onClick={handleMinimize}
              >
                ➖
              </button>


              <button
                className="close-btn"
                onClick={handleClose}
              >
                ✕
              </button>


            </div>


          </div>



          <div className="chat-body">


            {chat.map((c, i) => (

              <div
                key={i}
                className={c.sender === "bot" ? "bot" : "user"}
              >
                {c.text}
              </div>

            ))}



            <div className="quick">


              <button onClick={() => sendMessage("Explore Services")}>
                Explore Services
              </button>


              <button onClick={() => sendMessage("Training Programs")}>
                Training Programs
              </button>


              <button onClick={() => sendMessage("Business Collaboration")}>
                Business Collaboration
              </button>


              <button onClick={() => sendMessage("Other Enquiries")}>
                Other Enquiries
              </button>


            </div>


          </div>




          <div className="chat-input">


            <input

              value={message}

              onChange={(e)=>setMessage(e.target.value)}

              onKeyDown={handleKeyDown}

              placeholder="Type your message..."

            />


            <button onClick={()=>sendMessage()}>
              ➤
            </button>


          </div>



        </div>

      )}





      {(!isOpen || isMinimized) && (

        <div
          className="floating"
          onClick={handleFloatingClick}
        >

          <img
            src={robot}
            alt="Open ZeNA chat"
          />

        </div>

      )}



    </>

  );

}


export default Chatbot;