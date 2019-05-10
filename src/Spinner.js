import React from 'react';
import {Loader, Dimmer} from 'semantic-ui-react';

const Spinner = () => (
		<Dimmer active>
			<Loader size="huge" content={"Chat is getting ready .... "}/>
		</Dimmer>
);

export default Spinner;