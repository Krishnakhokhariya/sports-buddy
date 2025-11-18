import React from "react";

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className=" min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}

export default AuthCard;
