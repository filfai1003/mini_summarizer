import React from 'react';

const Header: React.FC = () => {
	return (
		<header style={{ background: '#0f172a', color: 'white' }}>
			<div className="container header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<div style={{ width: 36, height: 36, borderRadius: 8, background: '#0ea5e9' }} />
					<div>
						<div className="title">Mini Summarizer</div>
						<div className="muted" style={{ fontSize: 12 }}>Concise summaries in a snap</div>
					</div>
				</div>
				<nav className="controls">
					<a href="/" style={{ color: 'white' }}>Home</a>
				</nav>
			</div>
		</header>
	);
};

export default Header;
