enum PinState {
	HIGH = 1,
	LOW = 0,
}

type DetConfType = {
	// vid_src: number;
	enabled: boolean;
	vid_config: CameraConfigType;
	image: string;
	trigger_type: string;
	cycle_time?: number;
	pin?: number;
	pin_active_state?: PinState;
};

type DetType = {
	name: string;
	id: string;
	query: string;
	config: DetConfType;
};

type DetBaseType = {
	name: string;
	id: string;
	query: string;
	type: string;
	created_at: string;
	group_name: string;
	confidence_threshold: number;
};

type CameraType = {
	image: string;
	config: CameraConfigType;
};

type CameraConfigType = {
	name: string;
	idx?: number;
	serial_number?: string | number;
};
