import { useTheme } from '../context/ThemeContext';

export function useThemeClasses() {
    const { isDark } = useTheme();

    return {
        // Page backgrounds
        pageBg: isDark
            ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950'
            : 'bg-gradient-to-br from-slate-100 via-indigo-100/50 to-slate-100',

        // Card
        card: isDark
            ? 'bg-white/5 backdrop-blur border border-white/10'
            : 'bg-white border border-gray-200 shadow-lg shadow-gray-200/50',

        cardHover: isDark
            ? 'hover:bg-white/8 hover:border-white/20'
            : 'hover:bg-gray-50 hover:border-gray-300 hover:shadow-xl',

        // Navbar
        navBg: isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10'
            : 'bg-white border-b border-gray-200 shadow-sm',

        // Text
        textPrimary: isDark ? 'text-white' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-400' : 'text-gray-500',
        textMuted: isDark ? 'text-gray-500' : 'text-gray-400',
        textLabel: isDark ? 'text-gray-300' : 'text-gray-700',

        // Title gradient
        titleGradient: isDark
            ? 'bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent',

        // Input
        input: isDark
            ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
            : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400',

        inputFocus: 'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',

        // Border
        border: isDark ? 'border-white/10' : 'border-gray-200',

        // Nav link
        navLinkActive: isDark
            ? 'bg-white/15 text-white shadow-lg shadow-white/5'
            : 'bg-indigo-100 text-indigo-700 shadow-sm',

        navLinkInactive: isDark
            ? 'text-gray-300 hover:bg-white/10 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',

        // Logo text
        logoText: isDark
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent',

        // Buttons
        btnSecondary: isDark
            ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
            : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200',

        btnLogout: isDark
            ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30'
            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300',

        // Alert / Error
        errorBg: isDark
            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
            : 'bg-red-50 border border-red-200 text-red-600',

        successBg: isDark
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-600',

        // Demo credentials box
        demoBg: isDark
            ? 'bg-white/5 border-white/5'
            : 'bg-gray-50 border-gray-200',

        demoText: isDark ? 'text-gray-500' : 'text-gray-600',

        // Select / option bg
        optionBg: isDark ? 'bg-slate-900' : 'bg-white',

        // Modal overlay
        overlay: isDark
            ? 'bg-black/60 backdrop-blur-sm'
            : 'bg-black/40 backdrop-blur-sm',

        // Stat card icon container shadow
        iconShadow: 'shadow-lg',

        // Empty state
        emptyIcon: isDark ? 'text-gray-600' : 'text-gray-300',

        // Tag / badge helper
        roleBadgeColors: isDark
            ? {
                user: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                technician: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            }
            : {
                user: 'bg-blue-100 text-blue-700 border-blue-200',
                technician: 'bg-amber-100 text-amber-700 border-amber-200',
                admin: 'bg-rose-100 text-rose-700 border-rose-200',
            },

        // Status configs
        statusConfig: isDark
            ? {
                Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                'In-Progress': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                Resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            }
            : {
                Pending: 'bg-amber-100 text-amber-700 border-amber-300',
                'In-Progress': 'bg-blue-100 text-blue-700 border-blue-300',
                Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
            },
    };
}
