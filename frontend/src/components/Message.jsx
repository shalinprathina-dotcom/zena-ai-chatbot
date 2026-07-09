import Options from "./Options";
import ContactForm from "./ContactForm";
import robot from "../assets/robot.png";

function formatTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Message({
  message,
  onOptionClick,
  onFormSubmit,
  disabled,
}) {
  const isBot = message.role === "bot";
  const text =
    message.message ||
    message.content ||
    "Details submitted successfully.";

  const messageExtras = (
    <>
      {isBot &&
        message.links &&
        Object.keys(message.links).length > 0 && (
          <div className="links-container">
            {Object.entries(message.links).map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-btn"
              >
                🔗 {label}
              </a>
            ))}
          </div>
        )}

      {isBot &&
        message.form_fields &&
        message.form_fields.length > 0 && (
          <ContactForm
            fields={message.form_fields}
            onSubmit={onFormSubmit}
            disabled={disabled}
          />
        )}

      {isBot &&
        message.options &&
        message.options.length > 0 &&
        !message.form_fields?.length && (
          <Options
            options={message.options}
            onSelect={onOptionClick}
            disabled={disabled}
          />
        )}
    </>
  );

  if (isBot) {
    return (
      <div className="message bot">
        <div className="message-row">
          <img src={robot} alt="ZeNA" className="message-avatar" />

          <div className="message-content">
            <div className="message-bubble">{text}</div>
            <span className="message-time">
              {formatTime(message.timestamp)}
            </span>
            {messageExtras}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message user">
      <div className="message-content">
        <div className="message-bubble">{text}</div>
        <span className="message-time">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
