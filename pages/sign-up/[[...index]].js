import { SignUp } from "@clerk/nextjs";
import styles from '../../styles/clerkPages.module.css'; // We'll create this CSS file next

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
