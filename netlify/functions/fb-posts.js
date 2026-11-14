// Zwraca najnowsze posty ze strony klubu na Facebooku jako JSON: { items: [{ message, date, url, image }] }.
// Wymaga zmiennej środowiskowej FB_PAGE_TOKEN (token dostępu strony) ustawionej w Netlify:
// Site configuration → Environment variables. Token jest tajny: nie wpisuj go do plików strony.
// FB_PAGE_ID jest opcjonalne (domyślnie identyfikator strony facebook.com/ksmetro).

const PAGE_ID = process.env.FB_PAGE_ID || '186698348048954';
const HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

exports.handler = async function () {
  const token = process.env.FB_PAGE_TOKEN;
  if (!token) {
    return { statusCode: 503, headers: HEADERS, body: JSON.stringify({ error: 'Brak zmiennej FB_PAGE_TOKEN' }) };
  }
  try {
    const url = 'https://graph.facebook.com/' + encodeURIComponent(PAGE_ID) + '/posts' +
      '?fields=message,created_time,permalink_url,full_picture&limit=5&access_token=' + encodeURIComponent(token);
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || data.error) {
      // komunikat Facebooka trafia tylko do logów funkcji, nie do odwiedzających
      console.error('Facebook API:', data && data.error ? data.error.message : res.status);
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Facebook nie zwrócił postów' }) };
    }
    const items = (data.data || [])
      .filter((p) => p.message || p.full_picture)
      .map((p) => ({ message: p.message || '', date: p.created_time || '', url: p.permalink_url || '', image: p.full_picture || '' }));
    return {
      statusCode: 200,
      // 10 minut pamięci podręcznej, żeby nie odpytywać Facebooka przy każdym wejściu na stronę
      headers: Object.assign({ 'Cache-Control': 'public, max-age=600' }, HEADERS),
      body: JSON.stringify({ items }),
    };
  } catch (err) {
    console.error('fb-posts:', err && err.message);
    return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Błąd połączenia z Facebookiem' }) };
  }
};
