import React from 'react';
import ReactDOM from 'react-dom';
import App from 'app/App';
import OwnerView from 'app/OwnerView';
import './style.scss';

ReactDOM.render(
	<App>
		<OwnerView />
	</App>,
	document.getElementById('main-container')
);
