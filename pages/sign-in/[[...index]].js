import { SignIn } from "@clerk/nextjs";
import styles from '../../styles/clerkPages.module.css'; // We'll create this CSS file next

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
