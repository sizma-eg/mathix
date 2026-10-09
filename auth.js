import { auth, authReady } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export const ADMIN_EMAIL = "z1wae12008@gmail.com";

export function isAuthorizedAdmin(user) {
  return Boolean(
    user &&
    user.email &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function requireAdmin() {
  await authReady;

  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      unsubscribe();

      if (!isAuthorizedAdmin(user)) {
        if (user) {
          try {
            await signOut(auth);
          } catch (error) {
            console.error(error);
          }
        }

        location.replace("./index.html");
        resolve(null);
        return;
      }

      resolve(user);
    });
  });
}
