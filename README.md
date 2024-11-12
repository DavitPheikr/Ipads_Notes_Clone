# Apple iPad Notes Inspired AI-Powered Tool

This web-based application allows users to interact with a canvas to draw, erase, and visualize mathematical equations, physics problems, and other science-related queries. The tool uses AI-powered image processing via the Google Gemini API to interpret the content on the canvas and provides solutions in LaTeX format, making complex problems easier to solve and visualize.

## Tech Stack

### Front-End:
- **Typescript**: A superset of JavaScript that provides static typing and better developer tools.
- **React**: A JavaScript library for building dynamic user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Mantine**: A React component library with customizable themes and components.
- **Axios**: A promise-based HTTP client for making API requests.
- **Vite**: A next-generation build tool for fast development.

### Back-End:
- **Python**: A programming language used to build the server and handle API requests.
- **FastAPI**: A fast, modern web framework for Python used to build APIs.
- **Google Gemini AI API**: Used to process images and return parsed data for problem-solving.
- **Uvicorn**: An ASGI server for running FastAPI applications.
- **Pydantic**: Used for data validation and parsing in FastAPI.
- **MathJax**: A JavaScript library used to render LaTeX math formulas.

## Features

- **Interactive Canvas**:
  - Draw, erase, and reset with a customizable color palette.
  - Use the canvas to visually represent mathematical, scientific, or other general problems.
  
- **Problem Setup**:
  - Create mathematical equations, physics diagrams, or any other query directly on the canvas.
  
- **AI Processing**:
  - Press the "Run" button to send the current image to the back-end.
  - The back-end processes the image and sends it to the Google Gemini AI API for parsing.
  - The response is parsed and displayed as LaTeX-formatted results.

- **Rendering Results**:
  - The results are rendered as LaTeX math equations and displayed directly on the canvas or as draggable elements for easy reference.

## How to Use

1. **Set up the Problem**: Draw or write your problem on the canvas.
2. **Run the Solution**: Click the "Run" button to send the image to the server for processing.
3. **View the Result**: The solution will be returned in LaTeX format and displayed on the canvas.
