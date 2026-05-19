import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setState({
                message,
                confirmLabel: options.confirmLabel || 'Usuń',
                cancelLabel: options.cancelLabel || 'Anuluj',
                danger: options.danger !== false,
                resolve,
            });
        });
    }, []);

    const handleClose = (result) => {
        state?.resolve(result);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div className="modal-overlay" onClick={() => handleClose(false)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <p className="confirm-message">{state.message}</p>
                        <div className="confirm-actions">
                            <button className="btn-secondary" onClick={() => handleClose(false)}>
                                {state.cancelLabel}
                            </button>
                            <button
                                className={state.danger ? 'btn-danger' : 'btn-primary'}
                                onClick={() => handleClose(true)}
                            >
                                {state.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    return useContext(ConfirmContext);
}