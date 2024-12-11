import React, { useState, useRef } from 'react';
import {
    X,
    Minimize,
    Maximize,
    Edit,
    PanelRightClose,
    PanelRight,
    Trash2,
    Sun,
    Moon,
} from 'lucide-react';

const App = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [windows, setWindows] = useState([]);
    const [dragActive, setDragActive] = useState(null);
    const [showHistory, setShowHistory] = useState(true);
    const [isLatexValid, setIsLatexValid] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const dragRef = useRef(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Simple LaTeX validation (you'd want to replace this with a proper LaTeX parser)
    const validateLatex = (text) => {
        // This is a very basic validation - replace with proper LaTeX validation
        const bracketCount =
            (text.match(/\{/g) || []).length ===
            (text.match(/\}/g) || []).length;
        return bracketCount;
    };

    // Create new window
    const createWindow = (content = input) => {
        if (!content) return;
        const newWindow = {
            id: Date.now(),
            content,
            position: {
                x: 50 + windows.length * 20,
                y: 50 + windows.length * 20,
            },
            minimized: false,
        };
        setWindows([...windows, newWindow]);
        if (content === input) {
            setHistory([...history, input]);
            setInput('');
        }
    };

    // Handle window dragging
    const handleMouseDown = (e, id) => {
        const window = windows.find((w) => w.id === id);
        if (window) {
            setDragActive(id);
            const rect = e.currentTarget.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleMouseMove = (e) => {
        if (dragActive !== null) {
            setWindows(
                windows.map((window) => {
                    if (window.id === dragActive) {
                        return {
                            ...window,
                            position: {
                                x: e.clientX - dragOffset.x,
                                y: e.clientY - dragOffset.y,
                            },
                        };
                    }
                    return window;
                })
            );
        }
    };

    const handleMouseUp = () => {
        setDragActive(null);
    };

    // Toggle window minimize
    const toggleMinimize = (id) => {
        setWindows(
            windows.map((window) => {
                if (window.id === id) {
                    return { ...window, minimized: !window.minimized };
                }
                return window;
            })
        );
    };

    // Delete history item
    const deleteHistoryItem = (index) => {
        const newHistory = [...history];
        newHistory.splice(index, 1);
        setHistory(newHistory);
    };

    // Edit history item
    const editHistoryItem = (content) => {
        setInput(content);
    };

    return (
        <div
            className={`h-screen flex flex-col ${
                isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
            }`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Top Input Bar */}
            <div
                className={`p-4 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setIsLatexValid(validateLatex(e.target.value));
                        }}
                        className={`flex-1 p-2 border rounded ${
                            isDarkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter LaTeX..."
                    />
                    <button
                        onClick={() => createWindow()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create Window
                    </button>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`px-4 py-2 rounded ${
                            isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                    >
                        {showHistory ? <PanelRightClose /> : <PanelRight />}
                    </button>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`px-4 py-2 rounded ${
                            isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                    >
                        {isDarkMode ? <Sun /> : <Moon />}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative">
                {/* Center Preview */}
                <div
                    className={`flex-1 p-4 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
                >
                    <div className="mb-4">Current Preview:</div>
                    <div
                        className={`p-4 border rounded ${
                            isLatexValid
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        } ${isDarkMode ? 'bg-opacity-10' : ''}`}
                    >
                        {input}
                    </div>
                </div>

                {/* Minimized Windows Section */}
                <div
                    className={`absolute bottom-0 left-0 right-0 flex gap-2 p-2 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                >
                    {windows
                        .filter((w) => w.minimized)
                        .map((window) => (
                            <div
                                key={window.id}
                                className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 ${
                                    isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={() => toggleMinimize(window.id)}
                            >
                                <span className="truncate max-w-[100px]">
                                    {window.content}
                                </span>
                                <Maximize className="w-4 h-4" />
                            </div>
                        ))}
                </div>

                {/* Right History Sidebar */}
                {showHistory && (
                    <div
                        className={`w-64 border-l p-4 ${
                            isDarkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200'
                        }`}
                    >
                        <h2 className="font-bold mb-4">History</h2>
                        {history.map((item, index) => (
                            <div
                                key={index}
                                className={`p-2 border-b ${
                                    isDarkMode
                                        ? 'border-gray-700'
                                        : 'border-gray-200'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate max-w-[120px]">
                                        {item}
                                    </span>
                                    <div className="flex gap-2">
                                        <Edit
                                            className="w-4 h-4 cursor-pointer text-blue-500"
                                            onClick={() =>
                                                editHistoryItem(item)
                                            }
                                        />
                                        <Maximize
                                            className="w-4 h-4 cursor-pointer text-green-500"
                                            onClick={() => createWindow(item)}
                                        />
                                        <Trash2
                                            className="w-4 h-4 cursor-pointer text-red-500"
                                            onClick={() =>
                                                deleteHistoryItem(index)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating Windows */}
                {windows
                    .filter((w) => !w.minimized)
                    .map((window) => (
                        <div
                            key={window.id}
                            style={{
                                transform: `translate(${window.position.x}px, ${window.position.y}px)`,
                                position: 'absolute',
                                zIndex: dragActive === window.id ? 10 : 1,
                            }}
                            className={`w-64 border rounded shadow-lg ${
                                isDarkMode
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            {/* Window Header */}
                            <div
                                className={`p-2 cursor-move flex justify-between items-center ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}
                                onMouseDown={(e) =>
                                    handleMouseDown(e, window.id)
                                }
                            >
                                <span className="font-medium">
                                    LaTeX Window
                                </span>
                                <div className="flex gap-2">
                                    <Minimize
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={() =>
                                            toggleMinimize(window.id)
                                        }
                                    />
                                    <X
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={() =>
                                            setWindows(
                                                windows.filter(
                                                    (w) => w.id !== window.id
                                                )
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Window Content */}
                            <div className="p-4">{window.content}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default App;
