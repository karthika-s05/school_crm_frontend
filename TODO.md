# TODO

- [ ] Redesign Student Registration form UI/UX
  - [x] Update `src/pages/registration/registration.css`
    - [x] Add responsive card layout + grid
    - [x] Add consistent input/select styling (`.effect-1`, focus ring)
    - [x] Improve error message styling
    - [x] Style cancel/submit buttons
  - [x] Update `src/pages/registration/registration.js`
    - [x] Fix JSX: `class` -> `className` for breadcrumb + buttons
    - [x] Render InputField/SelectField as JSX components instead of function calls
    - [x] Improve select control: use `formData[data.name] ?? ""`
    - [x] Add Student Registration-specific wrapper class (e.g., `register-card--student`)
- [x] Verify in browser: Student Registration page responsive, validation shows correctly, no React warnings.
- [x] Redesign master sub menu table style (master.css/table styles)




