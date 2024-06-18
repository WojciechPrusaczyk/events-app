# Aplikacja do eventów

# Instalacja

# Roadmap

1. [ ] Nazwa, logo, uzgodnienie części technologicznej
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