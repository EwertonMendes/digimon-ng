# DigiAngular

Welcome to DigiAngular! This project is an Angular application designed to manage and display information about Digimon. It showcases advanced Angular features, state management, animations, and more.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture and Best Practices](#architecture-and-best-practices)
- [Libraries and Tools](#libraries-and-tools)
- [Animations](#animations)
- [State Management](#state-management)
- [Conclusion](#conclusion)

## Project Overview

DigiAngular is an Angular application that allows users to manage and view Digimon data. The application includes features such as displaying Digimon status cards, handling attribute changes with animations, and managing state effectively.

![image](https://github.com/user-attachments/assets/0e7fab44-9d94-4839-94fa-f0649f2435f1)

![image](https://github.com/user-attachments/assets/9794f84c-ff6c-4fc4-84c7-29e9ee315661)


## Features

- **Digimon Status Cards**: Display detailed information about each Digimon, including HP, MP, and other attributes.
- **Moving Digimon Cards**: The player can drag and drop the digimon cards moving along between the allowed areas like, Upfront Team, Hospital, Training, and Bit farm areas.
- **Attribute Change Animations**: Visual feedback for attribute changes, such as HP and MP, with smooth animations.
- **Evolution Tree**: Displays the evolution tree of a specific digimon, showing its current evolution line and possible evolutions and degenerations.
- **Battle**: Allows the player to battle with its team against other digimons, displaying a battle log and the current turn order.
- **Digimon Storage**: Allows the player to store multiple digimons that are not beeing used at the moment.
- **Player Status Modal**: Shows player info, such as Bits, Level, Exp, and digimon count.
- **Debug**: Used just to test some features, allowing the user to obtain a radom digimon, to choose a certain digimon, or clear its digimon storage.

## Architecture and Best Practices

DigiAngular follows a modular architecture, promoting separation of concerns and reusability. Key architectural practices include:

- **Component-Based Architecture**: Each feature is encapsulated within its own component, making the application scalable and maintainable.
- **Service-Oriented Architecture**: Business logic and data management are handled by services, ensuring a clear separation between the UI and the underlying logic.
- **Reactive Programming**: Utilizes RxJS for handling asynchronous data streams and angular signals, making the application more responsive and easier to manage.


## Libraries and Tools

DigiAngular leverages several libraries and tools to enhance development and functionality:

- **Angular**: The core framework for building the application.
- **Angular Animations**: For creating smooth and responsive animations.
- **Sigma**: For creating interactive and modular digi-evolution graphs
- **SCSS**: For styling the application with a modular and maintainable approach.

## Animations

The application includes several animations to enhance the user experience:

- **Damage Animation**: Provides visual feedback when a Digimon takes damage, including a shake effect.
- **FadeUp Animation**: Smoothly fades up elements when they enter the view.
- **Highlight Animation**: Temporarily changes the color and size of text to indicate attribute changes.

## State Management

State management is handled using Angular's reactive features and services:

- **GlobalStateDataSource**: Acts as a central store for the application's state, providing a single source of truth.

## Conclusion

DigiAngular is a robust and feature-rich Angular application that demonstrates advanced techniques and best practices. It showcases the power of Angular for building uncommon applications, with a focus on state management, animations, and interactive interfaces.

Thank you for exploring DigiAngular!

## Other Screenshots:

### Start Game Screen:

![image](https://github.com/user-attachments/assets/3dc5f4a8-9f42-44be-9c16-477f6a79ea52)

### Aventure route:

![image](https://github.com/user-attachments/assets/160b432a-73b5-400e-9a55-c975e22555ca)

### Battle:

![image](https://github.com/user-attachments/assets/64f93007-7812-4a68-a22e-171e09a76262)

![image](https://github.com/user-attachments/assets/6f11bb03-706c-47f6-8ff3-714c52ac0816)

### Digimon Details:
![image](https://github.com/user-attachments/assets/7bfc2eaa-188c-4c7a-b91d-a5adfb6a67cc)

### Evolution Tree Explorer:

![image](https://github.com/user-attachments/assets/4b4e0773-ca45-4634-99c3-b2ac47e18aed)

### Digimon Storage:

![image](https://github.com/user-attachments/assets/4612afb7-a8ed-4700-a66d-76f03bfaf0b5)

### Digilab:

![image](https://github.com/user-attachments/assets/4955f4e4-b2ad-4104-80d6-d288bfecd609)

### Player Data:

![image](https://github.com/user-attachments/assets/4a6207b2-537b-403c-ba3a-c19a01c231d2)

