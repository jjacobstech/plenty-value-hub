import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#81C14B' }}
          >
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#001845' }}>{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-border/50 p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}