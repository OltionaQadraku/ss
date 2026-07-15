/* =============================================
   AI for Students — Auth (Supabase)
   Replace placeholders with your Supabase keys.
   ============================================= */

const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";

let supabase = null;

function initSupabase() {
  if (typeof supabaseCreateClient === "undefined") return false;
  if (supabase) return true;
  supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

let currentSession = null;
let currentUser = null;

async function signUp(email, password, fullName) {
  if (!initSupabase()) throw new Error("Auth not initialized");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  if (!initSupabase()) throw new Error("Auth not initialized");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  if (!initSupabase()) return;
  await supabase.auth.signOut();
}

function updateAuthUI() {
  const authLinks = document.querySelector(".nav-auth-links");
  const userMenu = document.querySelector(".nav-user-menu");
  const userName = document.querySelector(".nav-user-name");

  if (!authLinks && !userMenu) return;

  if (currentSession && currentUser) {
    if (authLinks) authLinks.style.display = "none";
    if (userMenu) userMenu.style.display = "flex";
    if (userName) {
      userName.textContent =
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "User";
    }
  } else {
    if (authLinks) authLinks.style.display = "";
    if (userMenu) userMenu.style.display = "none";
  }
}

function setupAuthListeners() {
  if (!initSupabase()) {
    setTimeout(setupAuthListeners, 200);
    return;
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    currentUser = session?.user ?? null;
    updateAuthUI();
  });

  supabase.auth.getSession().then(({ data }) => {
    currentSession = data.session;
    currentUser = data.session?.user ?? null;
    updateAuthUI();
  });

  document.querySelectorAll(".nav-logout").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut();
      window.location.reload();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const check = () => {
    if (typeof supabaseCreateClient !== "undefined") {
      initSupabase();
      setupAuthListeners();
    } else {
      setTimeout(check, 100);
    }
  };
  check();
});
