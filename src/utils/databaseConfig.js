let currentDatabase = null;

const getSessionStorageToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const authDataRaw = window.sessionStorage.getItem('AuthqueryParams');
    if (!authDataRaw) return null;
    let authData;
    try {
      authData = JSON.parse(authDataRaw);
    } catch {
      authData = { atk: authDataRaw };
    }
    if (!authData?.atk) return null;

    const token = atob(authData.atk);
    return token || null;
  } catch (err) {
    console.error('Error reading token from sessionStorage:', err);
    return null;
  }
};

export const setCurrentDatabase = (db) => {
  currentDatabase = db ?? null;
};

export const getCurrentDatabase = () => currentDatabase;

export const getCurrentDatabaseToken = () => {
  if (currentDatabase?.token) {
    return currentDatabase.token;
  }
  const sessionToken = getSessionStorageToken();
  if (sessionToken) {
    return sessionToken;
  }
  return 'token_client1_secret_key_12345';
};