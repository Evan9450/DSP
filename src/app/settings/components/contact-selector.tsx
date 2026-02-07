'use client';

import * as React from 'react';
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from '@/components/ui/combobox';
import { useUsers } from '@/hooks/use-users';
import { UserResponse } from '@/lib/api/client';
import { Loader2 } from 'lucide-react';

interface ContactSelectorProps {
	value: number[];
	onChange: (value: number[]) => void;
	disabled?: boolean;
}

export function ContactSelector({
	value,
	onChange,
	disabled = false,
}: ContactSelectorProps) {
	const { users, isLoading } = useUsers();
	const anchor = useComboboxAnchor();

	// Convert user ID array to user object array
	const selectedUsers = React.useMemo(() => {
		return users.filter((user) => value.includes(user.id));
	}, [users, value]);

	// Handle selection change
	const handleValueChange = (selectedItems: UserResponse[]) => {
		const selectedIds = selectedItems.map((user) => user.id);
		onChange(selectedIds);
	};

	if (isLoading) {
		return (
			<div className='flex items-center gap-2 text-sm text-gray-500'>
				<Loader2 className='h-4 w-4 animate-spin' />
				<span>Loading users...</span>
			</div>
		);
	}

	return (
		<Combobox
			multiple
			autoHighlight
			items={users}
			value={selectedUsers}
			onValueChange={handleValueChange}
			disabled={disabled}>
			<ComboboxChips ref={anchor} className='w-full'>
				<ComboboxValue>
					{(values: UserResponse[]) => (
						<React.Fragment>
							{values.map((user) => (
								<ComboboxChip key={user.id}>
									{user.name}
								</ComboboxChip>
							))}
							<ComboboxChipsInput
								placeholder={
									values.length === 0
										? 'Select contacts for notifications...'
										: ''
								}
							/>
						</React.Fragment>
					)}
				</ComboboxValue>
			</ComboboxChips>
			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No users found</ComboboxEmpty>
				<ComboboxList>
					{(user: UserResponse) => (
						<ComboboxItem key={user.id} value={user}>
							<div className='flex flex-col'>
								<span className='font-medium'>{user.name}</span>
								<span className='text-xs text-gray-500'>
									{user.email}
									{user.phone && ` • ${user.phone}`}
								</span>
							</div>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
