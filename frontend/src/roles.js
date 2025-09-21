// roles.js
export const ROLES = {
  USER: "Utilisateur",
  PROFESSIONAL: "Professionnel",
};

// RegisterForm.jsx
import { ROLES } from "./roles";

<select
  name="role"
  value={formData.role}
  onChange={handleInputChange}
  style={{ ...inputStyle, borderColor: errors.role ? '#e74c3c' : '#ddd' }}
>
  <option value="">Sélectionnez un rôle</option>
  {Object.values(ROLES).map((role) => (
    <option key={role} value={role}>{role}</option>
  ))}
</select>
