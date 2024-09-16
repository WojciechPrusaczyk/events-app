[![Python](https://img.shields.io/badge/python%20%5E3.11.0-yellow?style=for-the-badge&logo=python)](https://www.python.org/downloads/)
[![NodeJS](https://img.shields.io/badge/nodejs%20%5E18.20.3-gray?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/en/download/prebuilt-installer)
[![Git](https://img.shields.io/badge/git-lightgray?style=for-the-badge&logo=git)](https://git-scm.com/downloads)
[![Git](https://img.shields.io/badge/PostgreSQL%20%5E16.3-white?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/download/)
[![ReactJS](https://img.shields.io/badge/React.js-gray?style=for-the-badge&logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-darkgreen?style=for-the-badge&logo=django)](https://docs.djangoproject.com/en/5.0/)

# Eventful :fire:
Service for creating and managing events.
### Key features:
- Event schedule :calendar:
- Reminders :calling:
- Event map :pushpin:
- Useful informations about event :page_with_curl:
- Surrounding events browser :mag:
  
### Roadmap

1. [x] Name, logo, deciding about tech stack
2. [x] Registration
3. [x] Signing in
4. [x] Creating event (mostly basic info)
5. [x] Event edition
6. [ ] Creating segments
7. [ ] Segment edition
8. [ ] Joining and sharing events
9. [ ] Event page (schedule, important infos)
10. [ ] Galleries (for events and segments)
11. [ ] Event map
12. [ ] Mobile app

### Bugs

1. [x] date picker in registration is broken
2. [ ] toggle nie może być focusowany
3. [ ] email wysyłany do potwierdzenia maila wysyła zły template
4. [ ] użytkownik bez zweryfikowanego emaila może używać aplikacji
5. [ ] opcja remember me nie działa, trzeba zweryfikować jakie ciasteczko zwrócić przy logowaniu
6. [ ] opcje IsActive, IsPublic i JoinThroughApproval nie działają przy edycji eventu
7. [ ] nie działa usuwanie miniatury eventu, na backend idzie null, ale na backendzie nie jest to obsługiwane

# Installation

1. Zainstaluj całe potrzebne oprogramwoanie.
2. Pobierz za pomocą IDE najświeższe repozytorium z githuba.
3. Utwórz w PostgreSQL (za pomocą PgAdmin) pustą bazę danych o nazwie "events-app".
4. Upewnij się, że masz odpowiedni connection string w backend/backend/settings.py (zmienna "DATABASES")
5. Wymigruj całą bazę danych do PostgreSQL.
6. Zainstaluj potrzebne biblioteki JS
```commandline
cd .\frontend\
npm install
```
7. Skompiluj pliki JS i CSS.
8. Jeśli gdzieś wystąpią błędy, to możliwe że nie posiadasz zainstalowanych bibliotek. Sprawdź komunikat o błędzie i zainstaluj wymagane biblioteki.

### Migracja bazy danych
Należy ją wykonać przy każdej zmianie w strukturze bazy danych.
```commandline
cd .\backend\
python manage.py makemigrations
python manage.py migrate
```
### Kompilacja plików JS i CSS
Należy wykonać przy każdej zmianie w plikach JS, czy CSS.
```commandline
cd .\frontend\
npm run build
```

### Uruchomienie lokalknego serwera deweloperskeigo
```commandline
cd .\backend\
python manage.py runserver
```

### Wypychanie lokalnych zmian na GitHuba
Zalecam jednak wykonanie tych działań z pomocą wbudowanego w IDE narzędzia do zarządzania projektem w GIT.
```commandline
git add .
git commit -m "Komentarz odnośnie wykonanych prac"
git push
```

### Otwieranie konsoli PostgreSQL
```commandline
python manage.py dbshell
```

### Usuwanie wszystkich tabel
```commandline
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
```
<!--
# Mapa aplikacji
- Strona główna (/):  
Publiczne wydarzenia z twojej okolicy, z możliwością dołączenia.
- Logowanie (/login)
- Rejestracja (/register)
- Ustawienia konta (/account)
- Stwórz wydarzenie(/create-event):  
    Pozwala na ustalenie: 
  - Segmenty: Część danego wydarzenia.
    - Opiekun
    - Prelegenci
    - Ramy czasowe
    - Opis
    - Miejsce
    - Opis
    - Galeria
  - Ramy czasowe
  - Harmonogram
  - Opis
  - Galeria wydarzenia
  - Mapa wydarzenia
  - Zasoby organizatora
  - Zadania
- Dołącz do wydarzenia(/join-event?i={token}):  
Token to unikalny krótki kod tworzony na podstawie aktualnych wydarzeń,  
umożliwiający dołączanie za pomocą kodu.  
Na samej podstronie join-event, zawarty jest także skaner kodów QR(wersja mobilna)
- Wydarzenie:  
Zawiera:
  - Część organizatora(/event/organizer?i={token})
    - Możliwość edycji parametrów wydarzenia  
    (przy zmianach w harmonogramie, wysyłane są powiadomienia do uczestników)
    - Zarządzanie uczestnikami, oraz ich rolami
    - Zarządzanie zasobami
    - Zarządzanie zadaniami
    - Udostępnij wydarzenie:  
    Tutaj jest możliwość wydrukowania kodu QR prowadzącego zarówno do aplikacji, jak i samego wydarzenia.
    - Dodaj uczestników:
    Gdy wydarzenie jest prywatne, to tutaj możemy ręcznie dodawać użytkowników, lub udostępniać prywatny link do dołączania do wydarzenia.
  - Część uczestnika(/event?i={token})
    - Plan wydarzenia
    - Galeria
    - Opis
    - Mapa wydarzenia
    - Uczestnicy
-->
