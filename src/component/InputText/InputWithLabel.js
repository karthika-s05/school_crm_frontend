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
  const [dropdownValue, SetDropdownValue] = useState([]);
  const currentDate = new Date();
  const [validationErrors, setValidationErrors] = useState({});
  console.log(data);
  useEffect(() => {
    if (data) {
      switch (propsData) {
        case "State":
          const state = data.map((value, index) => ({
            id: value.id,
            value: value.name,
          }));
          SetDropdownValue((prevData) => ({
            ...prevData,
            nationId: state,
          }));
          console.log(state);
          // dropdown.push({ id: value.id, value: value.name })
          break;
        case "City":
          const city = data.map((value, index) => ({
            id: value.id,
            value: value.name,
          }));
          SetDropdownValue((prevData) => ({
            ...prevData,
            stateId: city,
          }));
          break;
        case "Class & Section":
        case "Period Slot":
        case "Class Time Table":
        case "Products":
          const resultObjectCS = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          console.log("g", resultObjectCS);
          SetDropdownValue(resultObjectCS);
          break;
        case "Class Teacher":
          const resultObjectCT = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultObjectCT);
          break;
        case "Subject Teacher":
          const resultObject = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultObject);
          break;
        case "Assignment":
          const resultObjec = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultObjec);
          break;
        case "Homework":
          const resultObjects = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultObjects);
          break;
        case "Exam Type":
          const resultObjectExam = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultObjectExam);
          break;
        case "Exam Portion":
          const resultExam = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultExam);
          break;
        case "Events":
          const resultEvents = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultEvents);
          break;
        case "Exam Report List":
          const resultReports = data.reduce((accumulator, currentObject) => {
            return { ...accumulator, ...currentObject };
          }, {});
          SetDropdownValue(resultReports);
          break;
        default:
          console.log("No matching data scenario");
      }
    }
  }, []);
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
         ref={inputRef}
          className="effect-1"
          name={name}
          defaultValue={value}
          onChange={onChange}
        >
          {value ? (
            <option value={value} style={{color:"red"}}>{value}</option>
          ) : (
            <option value="">Select {label}</option>
          )}
          {dropdownValue[name] && (
            <>
              {dropdownValue[name].map((option, index) => (
                <option key={index} value={option.id}>
                  {option.value}
                </option>
              ))}
            </>
          )}
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
                  defaultValue={value}
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
                  defaultValue={value}
                  onChange={onChange}
                  onKeyPress={(event) => { if (!validate(event)) event.preventDefault(); }}
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
