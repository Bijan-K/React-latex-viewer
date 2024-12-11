import React, { useState, useRef } from 'react';
import {
    X,
    Minimize,
    Maximize,
    Edit,
    PanelRightClose,
    PanelRight,
} from 'lucide-react';

const App = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [windows, setWindows] = useState([]);
    const [dragActive, setDragActive] = useState(null);
    const [showHistory, setShowHistory] = useState(true);
    const [editingHistory, setEditingHistory] = useState(null);
    const dragRef = useRef(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

    // Edit history item
    const startEditingHistory = (index) => {
        setEditingHistory(index);
    };

    const saveHistoryEdit = (index, newValue) => {
        const newHistory = [...history];
        newHistory[index] = newValue;
        setHistory(newHistory);
        setEditingHistory(null);
    };

    return (
        <div
            className="h-screen flex flex-col"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Top Input Bar */}
            <div className="p-4 border-b">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border rounded"
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
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        {showHistory ? <PanelRightClose /> : <PanelRight />}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex relative">
                {/* Center Preview */}
                <div className="flex-1 p-4 bg-gray-50">
                    <div className="mb-4">Current Preview:</div>
                    <div className="p-4 border rounded bg-white">{input}</div>
                </div>

                {/* Right History Sidebar */}
                {showHistory && (
                    <div className="w-64 border-l p-4 bg-white">
                        <h2 className="font-bold mb-4">History</h2>
                        {history.map((item, index) => (
                            <div key={index} className="p-2 border-b">
                                {editingHistory === index ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) =>
                                                saveHistoryEdit(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            className="p-1 border rounded"
                                            autoFocus
                                            onBlur={() =>
                                                setEditingHistory(null)
                                            }
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    saveHistoryEdit(
                                                        index,
                                                        e.target.value
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span>{item}</span>
                                        <div className="flex gap-2">
                                            <Edit
                                                className="w-4 h-4 cursor-pointer text-blue-500"
                                                onClick={() =>
                                                    startEditingHistory(index)
                                                }
                                            />
                                            <Maximize
                                                className="w-4 h-4 cursor-pointer text-green-500"
                                                onClick={() =>
                                                    createWindow(item)
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating Windows */}
                {windows.map((window) => (
                    <div
                        key={window.id}
                        style={{
                            transform: `translate(${window.position.x}px, ${window.position.y}px)`,
                            position: 'absolute',
                            zIndex: dragActive === window.id ? 10 : 1,
                        }}
                        className={`w-64 bg-white border rounded shadow-lg ${
                            window.minimized ? 'h-10' : ''
                        }`}
                    >
                        {/* Window Header */}
                        <div
                            className="p-2 bg-gray-100 cursor-move flex justify-between items-center"
                            onMouseDown={(e) => handleMouseDown(e, window.id)}
                        >
                            <span className="font-medium">LaTeX Window</span>
                            <div className="flex gap-2">
                                {window.minimized ? (
                                    <Maximize
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={() =>
                                            toggleMinimize(window.id)
                                        }
                                    />
                                ) : (
                                    <Minimize
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={() =>
                                            toggleMinimize(window.id)
                                        }
                                    />
                                )}
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
                        {!window.minimized && (
                            <div className="p-4">{window.content}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
