import { observer } from "mobx-react-lite";
import { DeleteAccountModal } from "@/components/tg-mobx/modals/delete";
import { EditPasswordModal } from "@/components/tg-mobx/modals/edit-password";
import { MessageModal } from "@/components/tg-mobx/modals/message";
import { ProvideModal } from "@/components/tg-mobx/modals/provide";
import { AddAccountModal } from "@/components/tg-mobx/modals/add-account";

export const Modals = observer(() => {
	return (
		<>
			<AddAccountModal />
			<DeleteAccountModal />
			<EditPasswordModal />
			<ProvideModal />
			<MessageModal /> {/* generic modifiable modal */}
		</>
	);
});