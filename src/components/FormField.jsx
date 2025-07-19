import React from 'react';

const FormField = ({
   label,
   name,
   register,
   error,
   type = 'text',
   placeholder,
   required = false,
   icon: Icon,
   options = [],
   ...props
}) => {
   return (
      <div className="space-y-2">
         <label className="block text-sm font-medium text-gray-700">
            {Icon && <Icon className="inline w-4 h-4 mr-1" />}
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
         </label>

         {type === 'select' ? (
            <select
               {...register(name, { required: required ? `${label} is required` : false })}
               className="input-field"
               {...props}
            >
               {options.map((option) => (
                  <option key={option.value} value={option.value}>
                     {option.label}
                  </option>
               ))}
            </select>
         ) : type === 'textarea' ? (
            <textarea
               {...register(name, { required: required ? `${label} is required` : false })}
               className="input-field"
               placeholder={placeholder}
               rows={3}
               {...props}
            />
         ) : (
            <input
               type={type}
               {...register(name, { required: required ? `${label} is required` : false })}
               className="input-field"
               placeholder={placeholder}
               {...props}
            />
         )}

         {error && (
            <p className="text-red-500 text-sm">{error.message}</p>
         )}
      </div>
   );
};

export default FormField;