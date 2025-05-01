// frontend/src/components/ui/card.jsx
export function Card({ className = "", ...props }) {
    return <div className={`rounded-2xl bg-white shadow-md ${className}`} {...props} />;
  }
  
  export function CardContent({ className = "", ...props }) {
    return <div className={`p-4 ${className}`} {...props} />;
  }