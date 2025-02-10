"use client";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, ...props }: TextAreaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm 
        focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
        bg-white text-gray-900 p-3"
        rows={3}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
