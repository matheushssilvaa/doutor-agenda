import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader
} from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import ClinicForm from "./components/form"

const ClinicFormPage = () => {
    return (
        <div>
            <Dialog open>
                <form>
                    <DialogContent >
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save when you&apos;re
                                done.
                            </DialogDescription>
                        </DialogHeader>
                        <ClinicForm />
                    </DialogContent>
                </form>
            </Dialog>
        </div>
    )
}

export default ClinicFormPage