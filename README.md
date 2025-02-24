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

![image](https://github.com/user-attachments/assets/d72b421c-07ca-4f31-b514-5ee88f57c17e)

![image](https://github.com/user-attachments/assets/26ef1667-4125-4ecf-bb6f-b47c375bc537)


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
