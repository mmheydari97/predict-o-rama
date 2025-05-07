import React, { useState, createContext, useContext, useMemo } from 'react';

// --- Shadcn/ui Component Stubs (Enhanced Mocks with Modern Styling) ---

export const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled, ...props }) => {
  // Base styles with focus-visible states and transitions
  const baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-sm hover:shadow-md active:scale-[0.98]";
  // Variant styles using CSS variables for colors
  const variants = {
    default: `bg-primary text-primary-foreground hover:bg-primary/90 ${disabled ? 'bg-primary/50 cursor-not-allowed opacity-70 shadow-none active:scale-100' : ''}`,
    destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 ${disabled ? 'bg-destructive/50 cursor-not-allowed opacity-70 shadow-none active:scale-100' : ''}`,
    outline: `border border-input bg-transparent hover:bg-accent hover:text-accent-foreground ${disabled ? 'border-muted text-muted-foreground opacity-50 cursor-not-allowed shadow-none active:scale-100' : ''}`,
    secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80 ${disabled ? 'bg-secondary/50 cursor-not-allowed opacity-70 shadow-none active:scale-100' : ''}`,
    ghost: `hover:bg-accent hover:text-accent-foreground shadow-none ${disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed active:scale-100' : ''}`,
    link: `text-primary underline-offset-4 hover:underline shadow-none ${disabled ? 'text-muted-foreground opacity-50 cursor-not-allowed active:scale-100' : ''}`,
  };
  // Size variants
  const sizes = { default: "h-10 px-5 py-2", sm: "h-9 rounded-md px-3", lg: "h-12 rounded-lg px-8 text-base", icon: "h-10 w-10 shadow-sm" }; // Slightly larger default padding

  return <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} onClick={onClick} disabled={disabled} {...props}>{children}</button>;
};

export const Input = ({ className = '', type = 'text', ...props }) => (
    <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150 shadow-inner ${className}`}
        {...props}
    />
);

export const Card = ({ children, className = '', ...props }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ children, className = '', ...props }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;

export const CardTitle = ({ children, className = '', as = 'h3', ...props }) => {
    const Tag = as;
    return <Tag className={`text-xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</Tag>;
}

export const CardDescription = ({ children, className = '', ...props }) => <p className={`text-sm text-muted-foreground ${className}`} {...props}>{children}</p>;

export const CardContent = ({ children, className = '', ...props }) => <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;

export const CardFooter = ({ children, className = '', ...props }) => <div className={`flex items-center p-6 pt-4 bg-muted/20 border-t ${className}`} {...props}>{children}</div>;

export const Select = ({ children, value, onValueChange, className = '', ...props }) => (
    <select
        className={`flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full shadow-inner transition-colors duration-150 appearance-none bg-no-repeat bg-right pr-8 ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1em 1em' }}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
    >
        {children}
    </select>
);

export const SelectItem = ({ children, value, ...props }) => <option value={value} {...props}>{children}</option>;

// Tabs Component (Enhanced Styling)
const TabsContext = createContext(null);

export const Tabs = ({ children, defaultValue, className = '', orientation = 'horizontal', ...props }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    const contextValue = useMemo(() => ({ activeTab, setActiveTab, orientation }), [activeTab, orientation]);
    return (
        <TabsContext.Provider value={contextValue}>
            <div className={`flex ${orientation === 'vertical' ? 'flex-row' : 'flex-col'} ${className}`} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ children, className = '', ...props }) => {
    const { orientation } = useContext(TabsContext);
    return (
        <div
            className={`inline-flex h-auto items-center justify-start rounded-md bg-muted/50 p-1 text-muted-foreground ${orientation === 'vertical' ? 'flex-col h-full w-auto border-r' : 'flex-row border-b'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const TabsTrigger = ({ children, value, className = '', ...props }) => {
    const { activeTab, setActiveTab, orientation } = useContext(TabsContext);
    const isActive = activeTab === value;
    return (
        <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-background text-primary shadow-sm' : 'hover:bg-accent/70 hover:text-accent-foreground'} ${orientation === 'vertical' ? 'w-full justify-start' : ''} ${className}`}
            onClick={() => setActiveTab(value)}
            {...props}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ children, value, className = '', ...props }) => {
    const { activeTab, orientation } = useContext(TabsContext);
    return activeTab === value ? (
        <div className={`ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fadeIn ${orientation === 'vertical' ? 'pl-4' : 'mt-4'} ${className}`} {...props}>
            {children}
        </div>
    ) : null;
};

// Table Component (Slightly more padding)
export const Table = ({ children, className = '', ...props }) => <div className="w-full overflow-auto rounded-lg border"><table className={`w-full caption-bottom text-sm ${className}`} {...props}>{children}</table></div>;
export const TableHeader = ({ children, className = '', ...props }) => <thead className={`[&_tr]:border-b bg-muted/50 ${className}`} {...props}>{children}</thead>;
export const TableBody = ({ children, className = '', ...props }) => <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>{children}</tbody>;
export const TableRow = ({ children, className = '', ...props }) => <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`} {...props}>{children}</tr>;
export const TableHead = ({ children, className = '', ...props }) => <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>{children}</th>;
export const TableCell = ({ children, className = '', ...props }) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>{children}</td>; // Default padding p-4
