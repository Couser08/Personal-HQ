import { type TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`textarea-field ${className}`}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
