# MAWUGI Kopfbögen
Dies ist eine einfache Vorlagenverwaltung / Template Management für das Dokumentenmanagementsystem (DMS) d.velop documents. Die technische Umsetzung erfolgt dabei komplett im d.velop process studio und bietet unter anderem folgende Funktionen:
  - Einfügen von DMS-Eigenschaften
  - Einfügen von IDP-Werten
  - Einfügen von LDAP-Informationen (AD)

## Vorlagen
Die Vorlagen sind einfache Word-Dateien (*.docx). Die die Platzhalter für die Variablen werden formatiert im Text mitgeführt und durch geschweifte Klammern **{ }** gekennzeichnet.

![Vorlage](https://github.com/WulfGeoinformatik/MAWUGI-Kopfboegen/blob/8c31e44a6857dcdc815f38221617a2aa79d33123/template.png)

## Nutzung
Das Startformular kann an jeder beliebigen Dokumentart (Kategorie) als Kontext-Aktion registriert werden. 
  - Das Startformular liest die Konfiguration aus und bietet dann die für die Kategorie vorgesehenen Vorlagen zur Auswahl an.
  - Die Vorlage wird dann im Hintergrund automatisch erstellt und hochgeladen.
Im Anschluss wird der Nutzer zu einem Ablage Dialog weitergeleitet.

![Formular](https://github.com/WulfGeoinformatik/MAWUGI-Kopfboegen/blob/107c04b46f4ce0881a1fd1abc3882f7499c7cba2/start_form.png)

## Konfiguration
  -	Je Vorlage wird ein Objekt im Array "Vorlagen" eingefügt.
    - Das Feld "Name" muss dabei eindeutig und einmalig sein.
    - Der Display Name darf sich wiederholen.
    - Die Dock-ID verweist auf die Vorlage.
  -	Eine Vorlage kann an mehreren Kategorien registriert werden. 
  -	Je Registrierung wird ein Objekt im Array Mappings benötigt.
    - Die Key sind die Platzhalter für die Word-Datei.
    - Bei der dms.id handelt es sich um die Kurz-ID, welche im D3_admin oder über die API einzusehen ist.
