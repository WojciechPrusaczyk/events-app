# Aplikacja do eventów

# Instalacja

Wymagane oprogramowanie:
- [GIT](https://git-scm.com/downloads)
- [PostreSQL](https://www.postgresql.org/download/)
- [Postman](https://www.postman.com/downloads/), lub wtyczka Visual Studio do tworzenia zapytań API
- [NodeJS v18.20.3](https://nodejs.org/en/download/prebuilt-installer)
- IDE: [PyCharm](https://www.jetbrains.com/pycharm/download/?section=windows), ewentualnie [Visual Studio Code](https://code.visualstudio.com/)
- [Python v3.11.0](https://www.python.org/downloads/)

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


# Roadmap

1. [x] Nazwa, logo, uzgodnienie części technologicznej
2. [ ] Strona główna w podstawowej wersji (bez okolicznych wydarzeń).
3. [ ] Rejestracja
4. [ ] Logowanie
5. [ ] Tworzenie wydarzenia(Segmenty, Ramy czasowe, Harmonogram, Opis)
6. [ ] Edycja wydarzenia
7. [ ] Udostępnianie wydarzenia
8. [ ] Galerie wydarzeń i segmentów
9. [ ] Mapa wydarzenia
10. [ ] Zadania organizatorów
11. [ ] Zasoby

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