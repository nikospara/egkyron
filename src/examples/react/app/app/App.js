import React from 'react';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';

export default function App(props) {
	return (
		<div>
			<Navbar inverse fixedTop fluid>
				<Navbar.Header>
					<Navbar.Brand>Egkyron (in React)</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
			<div className="container-fluid">
				{props.children}
			</div>
		</div>
	);
}
