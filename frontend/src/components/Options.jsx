export default function Options({
  options = [],
  onSelect,
  disabled = false,
}) {

  if (options.length === 0) return null;

  return (
    <div className="options-container">

      {options.map((option, index) => (

        <button
          key={index}
          type="button"
          className="option-btn"
          disabled={disabled}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>

      ))}

    </div>
  );

}