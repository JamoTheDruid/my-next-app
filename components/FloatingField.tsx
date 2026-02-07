import styles from "./FloatingField.module.css";

type FloatingFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export default function FloatingField({ label, id, className, ...props }: FloatingFieldProps) {
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <input id={id} placeholder=" " {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}