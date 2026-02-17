import React, { useState, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

/**
 * DeleteResourceDialog
 * 
 * Reusable dialog for confirming specialized resource deletion.
 * Requires the user to type a confirmation keyword (default: "DELETE").
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onConfirm: function
 * - title: string
 * - resourceName: string
 * - description: string (optional override)
 * - confirmationKeyword: string (default: "DELETE")
 */
export default function DeleteResourceDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Resource",
    resourceName,
    description,
    confirmationKeyword = "DELETE",
}) {
    const theme = useTheme()
    const [inputValue, setInputValue] = useState("")

    // Reset input when dialog opens
    useEffect(() => {
        if (isOpen) {
            setInputValue("")
        }
    }, [isOpen])

    const handleConfirm = () => {
        if (inputValue === confirmationKeyword) {
            onConfirm()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description ? description : (
                            <>
                                Are you sure you want to delete <strong>{resourceName}</strong>? This action cannot be undone.
                                <br />
                                Type <strong>{confirmationKeyword}</strong> below to confirm.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div style={{ margin: `${theme.spacing[4]} 0` }}>
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Type ${confirmationKeyword} to confirm`}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={inputValue !== confirmationKeyword}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
