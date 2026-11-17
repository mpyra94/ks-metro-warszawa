# KS Metro Warszawa: strona klubu

Statyczna strona z panelem administracyjnym (Decap CMS). Nie wymaga budowania ani instalowania pakietów.

## Co gdzie jest

- `index.html`, `mecze.html`, `o-klubie.html` (historia, absolwenci, sukcesy), `druzyny.html`, `druzyna.html` (podstrona jednej drużyny), `trener.html` (podstrona jednego trenera), `trenerzy.html`, `harmonogram.html`, `dokumenty.html`, `kontakt.html`: podstrony
- `tools/`: arkusz Excel z meczami i skrypt `import_matches.py`, który zamienia go na `data/matches.json`
- `data/*.json`: wszystkie treści (edytowane przez panel `/admin/`)
- `css/style.css`: wygląd (kolory na górze pliku, w `:root`)
- `js/main.js`: wczytywanie treści z plików `data/`
- `admin/`: panel CMS (`config.yml` opisuje pola do edycji)
- `images/`: logo klubu (`logo.png`, `logo-white.png` do ciemnych teł, `favicon.png`), tło nagłówka (`hero-bg.jpg`) i zdjęcia z meczów (`foto-*.jpg`, autor: Paweł Oleksiak)

## Podgląd na własnym komputerze

Strona wczytuje dane przez `fetch`, więc nie zadziała po dwukliku w plik. Uruchom prosty serwer w folderze projektu:

    python3 -m http.server 8000

i otwórz http://localhost:8000.

## Wdrożenie (Netlify + GitHub, bezpłatnie)

1. Załóż repozytorium na GitHubie (np. `ks-metro-warszawa`) i wgraj do niego zawartość tego folderu.
2. W pliku `admin/config.yml` ustaw `repo: TWOJ_LOGIN_GITHUB/ks-metro-warszawa` oraz adresy `site_url` i `display_url`.
3. Na netlify.com wybierz „Add new site” → „Import from Git”, wskaż repozytorium. Polecenie budowania zostaw puste, katalog publikacji to `/`.
4. Żeby logować się do panelu kontem GitHub, w Netlify przejdź do „Site configuration” → „Access & security” → „OAuth” i dodaj GitHub jako dostawcę (potrzebna jest aplikacja OAuth założona w ustawieniach GitHuba). Dokładne kroki opisuje dokumentacja Decap CMS (sekcja o backendzie GitHub), bo Netlify i GitHub zmieniają układ ustawień.
5. Wejdź na `https://twoja-domena.pl/admin/`, zaloguj się i edytuj treści. Każdy zapis w panelu to zmiana w repozytorium, a strona odświeża się sama po kilkudziesięciu sekundach.

Osoby, które mają edytować treści, muszą mieć konto GitHub z dostępem do repozytorium.

## Strona główna: slider i zdjęcia

- Slider na górze czyta `data/slides.json` (panel: „Strona główna” → „Slider”). Każdy slajd ma tytuł, tekst i do dwóch przycisków. Slajdy zmieniają się co 7 sekund, a odwiedzający może je zatrzymać.
- Karuzela „Z boiska” czyta `data/gallery.json` (panel: „Strona główna” → „Zdjęcia w karuzeli Z boiska”). Dodając zdjęcie, wpisz autora i upewnij się, że klub ma zgodę na publikację.
- Strona główna jest pod logo w nagłówku, dlatego nie ma jej w menu.

## Zaufali nam

Na dole strony głównej może pojawić się baner z logotypami partnerów i sponsorów klubu. Ustawiasz go w panelu: „Ustawienia strony” → „Zaufali nam” (wgrywasz jeden obrazek ze wszystkimi logami). Sekcja jest ukryta, dopóki obrazek nie zostanie ustawiony.

## Harmonogram treningów: lista i kalendarz

Strona „Harmonogram treningów” ma dwa widoki. „Lista” pokazuje tygodniowy plan treningów z `data/schedule.json`. „Kalendarz” pokazuje wybrany miesiąc: treningi (powtarzane co tydzień) i mecze z terminarza. Na telefonie kalendarz zamienia się w listę dni.

## Drużyny i trenerzy

- Strona „Drużyny” czyta `data/teams.json`, a każda drużyna ma własną podstronę `druzyna.html?d=nazwa` (adres powstaje sam z nazwy, np. „Juniorzy I” → `juniorzy-i`). Podstrona pokazuje zdjęcie, skład, trenera i trzy najbliższe mecze.
- Wszystko edytujesz w panelu: „Drużyny” (nazwa, liga, opis, zdjęcie, skład z numerami i pozycjami, trenerzy) oraz „Trenerzy” (imię i nazwisko, funkcja, opis, zdjęcie).
- Trenera przypisujesz do drużyny, wybierając go z listy z zakładki „Trenerzy”. Jeśli zmienisz nazwisko trenera, wybierz go w drużynie ponownie.
- Najbliższe mecze drużyny strona dobiera sama: nazwa drużyny musi być taka sama jak w polu „Drużyna klubu” w meczach (np. „Juniorzy I”).

## Podstrony trenerów

Każdy trener ma własną podstronę `trener.html?t=imie-nazwisko` (adres powstaje sam z imienia i nazwiska). Pokazuje zdjęcie, funkcję, opis i drużyny, do których trener jest przypisany w zakładce „Drużyny”. Wszystko edytujesz w panelu: „Trenerzy”.

## Mecze: lista i kalendarz

Strona „Mecze” otwiera się w widoku listy (z filtrem drużyn), a przyciskiem „Kalendarz” przełączasz na widok miesiąca. Na telefonie kalendarz zamienia się w listę dni. W menu górnym zakładka jest czwarta, zaraz za „Trenerzy”.

Pole „Miejsce” przy meczu domowym (albo derbowym) nie musi być wypełnione ręcznie: jeśli jest puste, strona sama dopisuje halę na podstawie kategorii drużyny — juniorzy, kadeci i młodzicy grają w SP 323 (ul. Hirszfelda 11, Warszawa), a seniorzy na UCSIR (ul. Dereniowa 48, Warszawa). Żeby to nadpisać dla konkretnego meczu (np. turniej w innej hali), wystarczy wpisać „Miejsce” w panelu CMS — wpisana wartość ma priorytet.

Pasek „Najbliższy mecz” na stronie głównej pokazuje też odliczanie czasu do meczu („Pozostało: X dni Y godz. Z min”, aktualizowane co 30 sekund) i zawsze skaluje nazwy drużyn tak, żeby zajmowały maksymalnie dwa wiersze, nawet przy bardzo długich nazwach przeciwników.

## Kontakt: formularz i mapa

- Formularz zgłoszeniowy działa przez Netlify Forms. Po wdrożeniu włącz w Netlify „Forms” → „Enable form detection” i wdróż stronę jeszcze raz. Zgłoszenia zobaczysz w zakładce „Forms”, a powiadomienia e-mail ustawisz w „Forms” → „Form notifications”. Limity darmowego planu sprawdź w cenniku Netlify.
- Na własnym komputerze (podgląd lokalny) i na innym hostingu formularz pokaże komunikat o błędzie, bo nie ma kto odebrać zgłoszenia.
- Formularz zbiera dane osobowe, także dzieci. Potrzebna jest klauzula informacyjna RODO (kto jest administratorem danych, po co i jak długo je przechowuje). Zgoda przy formularzu to tylko punkt wyjścia, więc skonsultuj treść z osobą, która zajmuje się tym w klubie.
- Mapa (Google Maps) i przycisk „Wyznacz trasę” prowadzą na ul. Dereniową 48. Adresy zmienisz w panelu: „Kontakt”. Mapa Google może zapisywać cookies na urządzeniu odwiedzającego.

## O klubie

Strona „O klubie” ma trzy karty: Historia, Absolwenci i Sukcesy (adresy `o-klubie.html#historia`, `#absolwenci`, `#sukcesy`). Treści edytujesz w panelu: „O klubie”.

Historia, sukcesy i absolwenci pochodzą z archiwalnej wersji starej strony klubu (ksmetro.pl, web.archive.org), przekazanej przez klub. Lista sukcesów (`data/achievements.json`) to pełna lista medali Mistrzostw Polski ze starej strony. Lista absolwentów (`data/alumni.json`) zawiera kluby, w których ci zawodnicy grali w chwili archiwizacji starej strony (ok. 2015 r.), oraz ich obecne kluby sprawdzone w internecie w listopadzie 2026 r. — dla kilku osób nie udało się potwierdzić najnowszego klubu; jest to wprost zaznaczone w opisie danej osoby. Warto od czasu do czasu zweryfikować te dane ponownie, bo siatkarze zmieniają kluby co sezon.

## Dokumenty

Strona „Dokumenty” czyta `data/documents.json`. Pliki (PDF, DOCX itp.) dodajesz w panelu: „Dokumenty” → „Dodaj dokument” → wybierz plik. Pliki trafiają do folderu `files/` w repozytorium. Pozycje bez pliku pokazują napis „Plik wkrótce”. Lista na start jest przykładowa, więc zastąp ją prawdziwymi dokumentami klubu. Wszystko w tym folderze jest publiczne.

## Mecze (z Excela)

Sekcja „Nadchodzące mecze” na stronie głównej i cała strona „Mecze” czytają plik `data/matches.json`. Ten plik powstaje z arkusza Excel `tools/HARMONOGRAM_MECZOWY.xlsx` (arkusz „ŁĄCZNIE”). Gdy zmieni się terminarz:

1. Wgraj nowy plik Excel do folderu `tools/` pod tą samą nazwą (albo podaj jego nazwę w poleceniu).
2. Uruchom w folderze strony: `pip install openpyxl` (tylko raz), a potem `python3 tools/import_matches.py`.
3. Wgraj zmieniony `data/matches.json` do repozytorium.

Miejsce, rozgrywki, wynik i uwagi dopisane w panelu CMS zostają zachowane przy ponownym imporcie. Pojedyncze poprawki (np. wynik meczu) wygodniej robić w panelu: „Mecze”. Strona sama pokazuje tylko mecze przyszłe (mecz zostaje widoczny jeszcze 3 godziny po starcie), a rozegrane są pod przyciskiem „Pokaż także rozegrane”.

Folder `tools/` jest publiczny razem z resztą strony. Nie wrzucaj tam niczego poufnego.

## Aktualności z Facebooka

Posty z profilu https://www.facebook.com/ksmetro ładują się na stronie głównej od razu, bez klikania. Strona próbuje po kolei trzech sposobów:

1. **Kod widżetu** wklejony w panelu („Ustawienia strony” → „Kod widżetu z postami”). Obecnie puste — ten sposób jest wyłączony, bo widżety typu Elfsight renderowały się węziej niż kolumna „Aktualności” na stronie głównej. Zostawione jako opcja, gdyby kiedyś się przydała (np. inny dostawca widżetu).
2. **Własna funkcja** `netlify/functions/fb-posts.js` (obecnie aktywny, domyślny sposób), która pobiera posty przez oficjalne API Facebooka i pokazuje je we własnych, stylowanych kartach dopasowanych do wyglądu strony — bez żadnej marki firmy trzeciej. Wymaga tokenu dostępu strony (trzeba być administratorem profilu i założyć aplikację na developers.facebook.com). Token wpisujesz w Netlify jako zmienną środowiskową `FB_PAGE_TOKEN` („Site configuration” → „Environment variables”) i wdrażasz stronę ponownie. Tokenu nie wolno wpisywać do plików strony. **Działa tylko przy hostingu na Netlify** — funkcje serverless nie działają np. na GitHub Pages.

   **Skąd wziąć token (musisz być administratorem profilu facebook.com/ksmetro):**
   1. Wejdź na [developers.facebook.com](https://developers.facebook.com/), zaloguj się swoim prywatnym kontem Facebooka i w „My Apps” kliknij „Create App” (typ: „Business” / „Inne”, nazwa np. „KS Metro – strona WWW”). Aplikacja może zostać w trybie „Development” – nie trzeba jej zgłaszać do App Review, bo token będzie używany tylko przez Ciebie jako administratora strony.
   2. Przejdź do [Graph API Explorer](https://developers.facebook.com/tools/explorer/) (to narzędzie też jest na developers.facebook.com, w menu „Tools”). Z listy „Meta App” wybierz aplikację, którą właśnie założyłeś.
   3. W sekcji uprawnień („Permissions”) dodaj: `pages_show_list`, `pages_read_engagement` (do samego czytania postów to wystarczy; `pages_manage_metadata`/`pages_manage_posts` potrzebne są tylko, gdybyś chciał też publikować przez API).
   4. Kliknij „Generate Access Token”, zaloguj się i zatwierdź uprawnienia – dostajesz krótkotrwały token użytkownika (ważny ok. 1-2 godziny).
   5. W polu zapytania wpisz `/me/accounts` i kliknij „Submit” – w odpowiedzi zobaczysz listę stron, których jesteś administratorem, każda z własnym polem `access_token`. To jest **token strony**, ale wciąż krótkotrwały.
   6. Żeby token działał długo (docelowo bez terminu ważności), wymień go na długotrwały. Krok pierwszy – długotrwały token użytkownika – wymaga App ID i App Secret aplikacji (widoczne w „App settings” → „Basic” w panelu developerskim):

      ```
      GET https://graph.facebook.com/v21.0/oauth/access_token
          ?grant_type=fb_exchange_token
          &client_id=APP_ID
          &client_secret=APP_SECRET
          &fb_exchange_token=KRÓTKOTRWAŁY_TOKEN_UŻYTKOWNIKA_Z_KROKU_4
      ```

      (ten adres można po prostu wkleić w okno przeglądarki, podstawiając swoje wartości) – w odpowiedzi dostajesz długotrwały token użytkownika, ważny ok. 60 dni.
   7. Tym długotrwałym tokenem użytkownika zapytaj jeszcze raz o strony:

      ```
      GET https://graph.facebook.com/v21.0/me/accounts
          ?access_token=DŁUGOTRWAŁY_TOKEN_UŻYTKOWNIKA_Z_KROKU_6
      ```

      Pole `access_token` strony KS Metro w tej odpowiedzi to **długotrwały token strony** – według dokumentacji Facebooka nie ma on terminu wygaśnięcia (traci ważność tylko, gdy np. zmienisz hasło, usuniesz aplikację albo odbierzesz jej uprawnienia).
   8. Ten token (z kroku 7, nie z kroku 4 czy 6) wklej w Netlify: „Site configuration” → „Environment variables” → dodaj zmienną `FB_PAGE_TOKEN`, i wdróż stronę ponownie (Netlify musi zbudować ją na nowo, żeby funkcja zobaczyła nową zmienną).

   Jeśli po jakimś czasie posty przestaną się ładować (błąd w konsoli albo pusty widżet), token prawdopodobnie wygasł lub został odwołany – powtórz kroki 2-8, żeby wygenerować nowy, i zastąp nim wartość `FB_PAGE_TOKEN` w Netlify.
3. **Oficjalna wtyczka Facebooka** (działa bez konfiguracji). Ograniczenie Facebooka: posty widzą w niej tylko osoby zalogowane na Facebooku, reszta zobaczy sam nagłówek profilu. Dlatego nad oknem jest link do profilu.

Wtyczka i widżety ładują treści z zewnętrznych serwisów, które mogą zapisywać cookies. Skoro ładują się bez pytania, strona powinna mieć informację o cookies (baner zgody).

## Uwagi

- Dane kontaktowe i adres siedziby pochodzą z publicznych źródeł (strona klubu i rejestr firm). Sprawdź je, zanim opublikujesz stronę.
- **Treści wymyślone, do podmiany przed publikacją:** godziny zajęć w `data/schedule.json`. Zostały napisane jako wypełniacz na prośbę klubu i nie opisują prawdziwych terminów. Historia, sukcesy i absolwenci (`data/history.json`, `data/achievements.json`, `data/alumni.json`) są już oparte na faktach ze starej strony klubu — zobacz uwagi w sekcji „O klubie” wyżej, szczególnie o aktualnych klubach absolwentów.
- Czcionka to Exo 2 z Google Fonts. Jeśli chcesz tego uniknąć (RODO), pobierz Exo 2 i wskaż ją lokalnie w `css/style.css` (`@font-face`).
- Polityka prywatności i informacja o cookies nie są dołączone. Jeśli będziecie zbierać dane (np. formularz zapisów), trzeba je dodać.
