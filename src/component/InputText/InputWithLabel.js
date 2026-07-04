import React, { useEffect, useRef, useState } from "react";
import "./InputWithLabel.css";

const InputWithLabel = ({
  label,
  value,
  onChange,
  name,
  type,
  data,
  propsData,
  dateValue,
}) => {
  const [dropdownValue, SetDropdownValue] = useState({});
  const currentDate = new Date();
  const [validationErrors, setValidationErrors] = useState({});
  console.log("PropsData: ", propsData);
  console.log("Data: ", data);
  useEffect(() => {
    if (!data) return;

    const asArray = Array.isArray(data) ? data : [];

    switch (propsData) {
      case "State": {
        const nations = asArray.map((value) => ({
          id: value.id,
          value: value.name || value.Name || "",
        })).filter((o) => o.id != null && o.value);
        SetDropdownValue({ nationId: nations });
        break;
      }
      case "City": {
        const states = asArray.map((value) => ({
          id: value.id,
          value: value.name || value.State || value.state || "",
        })).filter((o) => o.id != null && o.value);
        SetDropdownValue({ stateId: states });
        break;
      }
      case "Class & Section":
      case "Period Slot":
      case "Class Time Table":
      case "Products": {
        const resultObjectCS = asArray.reduce(
          (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
          {}
        );
        SetDropdownValue(resultObjectCS);
        break;
      }
        case "Class Teacher": {
          const resultObjectCT = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultObjectCT);
          break;
        }
        case "Subject Teacher": {
          const resultObject = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultObject);
          break;
        }
        case "Assignment": {
          const resultObjec = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultObjec);
          break;
        }
        case "Homework": {
          const resultObjects = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultObjects);
          break;
        }
        case "Exam Type": {
          const resultObjectExam = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultObjectExam);
          break;
        }
        case "Exam Portion": {
          const resultExam = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultExam);
          break;
        }
        case "Events": {
          const resultEvents = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultEvents);
          break;
        }
        case "Exam Report List": {
          const resultReports = asArray.reduce(
            (accumulator, currentObject) => ({ ...accumulator, ...currentObject }),
            {}
          );
          SetDropdownValue(resultReports);
          break;
        }
        default:
          break;
      }
  }, [data, propsData]);
  const inputRef = useRef(null);
  const selectRef = useRef(null);
  useEffect(() => {
    if (name === 'name' && inputRef.current) {
      inputRef.current.focus();
    } else if (type === 'select' && selectRef.current) {
      selectRef.current.focus();
    }
  }, [name, type]);
  function SelectField() {
    return (
      <div className="input-container">
        <label className="input-label" style={{ gap: "1px" }}>
          {label} <span style={{ color: "red", fontWeight: "400" }}>*</span>
        </label>
        <select
          ref={selectRef}
          className="effect-1"
          name={name}
          value={value ?? ""}
          onChange={onChange}
        >
          <option value="">Select {label}</option>
          {dropdownValue[name] &&
            dropdownValue[name].map((option, index) => (
              <option key={index} value={option.id}>
                {option.value}
              </option>
            ))}
        </select>
        {validationErrors[name] && (
          <div className="error-message1">{validationErrors[name]}</div>
        )}
      </div>
    );
  }
  function validate(event) {
    var key = event.which || event.keyCode || 0;
    return ((key >= 65 && key <= 90) || (key >= 97 && key <= 122) || key === 32 || event.key === '+' || event.key === '-');
}

  const isDateInput = type === "date";
  return (
    <>
      {type === "select" ? (
        SelectField()
      ) : (
        <>
          <div className="input-container">
            <label className="input-label" style={{ gap: "1px" }}>
              {label}
              <span style={{ color: "red", fontWeight: "400" }}>*</span>{" "}
            </label>
            {isDateInput ? (
              <>
                <input
                ref={inputRef}
                  className="effect-1"
                  type={type}
                  name={name}
                  value={value}
                  min={
                    name === "toDate" || name === "endDate"
                      ? dateValue
                      : currentDate.toISOString().split("T")[0]
                  }
                  onChange={(e) => {
                    onChange(e);
                  }}
                />
                {validationErrors[name] && (
                  <p className="error-message1">{validationErrors[name]}</p>
                )}
              </>
            ) : type === "textarea" ? (
              <>
                <textarea
                  className="effect-1 text-area"
                  ref={inputRef}
                  name={name}
                  value={value ?? ""}
                  onChange={onChange}
                />
                {validationErrors[name] && (
                  <p className="error-message1">{validationErrors[name]}</p>
                )}
              </>
            ) : type === "date" ? (
              <>
                <input
                  className="effect-1"
                  ref={inputRef}
                  type={type}
                  name={name}
                  value={value}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={onChange}
                />
              </>
            ) : (
              <>
                <input
                  className="effect-1"
                  ref={inputRef}
                  type={type}
                  name={name}
                  value={value ?? ""}
                  onChange={onChange}
                />
                {validationErrors[name] && (
                  <p className="error-message1">{validationErrors[name]}</p>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default InputWithLabel;
