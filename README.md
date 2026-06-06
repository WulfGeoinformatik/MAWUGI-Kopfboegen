# MAWUGI Kopfbögen
Dies ist eine einfache Vorlagenverwaltung / Template Management für das Dokumentenmanagementsystem (DMS) d.velop documents. Die technische Umsetzung erfolgt dabei komplett im d.velop process studio und bietet unter anderem folgende Funktionen:
  - Einfügen von DMS-Eigenschaften
  - Einfügen von IDP-Werten
  - Einfügen von LDAP-Informationen (AD)

## Vorlagen
Die Vorlagen sind einfache Word-Dateien (*.docx). Die die Platzhalter für die Variablen werden formatiert im Text formatiert geführt und durch geschweifte Klammern **{ }** gekennzeichnet.

![Vorlage](https://github.com/WulfGeoinformatik/MAWUGI-Kopfboegen/blob/8c31e44a6857dcdc815f38221617a2aa79d33123/template.png)

## Nutzung
Das Startformular kann an jeder beliebigen Dokumentart (Kategorie) als Kontext-Aktion registriert werden. Das Startformular liest die Konfiguration aus und bietet dann die für die Kategorie vorgesehenen Vorlagen zur Auswahl an. Die Vorlage wird dann im Hintergrund automatisch erstellt und hochgeladen. Im Anschluss wird der Nutzer zu einem Ablage Dialog weitergeleitet.

![Formular](https://github.com/WulfGeoinformatik/MAWUGI-Kopfboegen/blob/107c04b46f4ce0881a1fd1abc3882f7499c7cba2/start_form.png)
