import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../styles/message-form.module.css';
import image from './paper-clip-6-64.png';
import play from './play-icon-white-png-8.jpg';
import stop from './Stop-circle-01.svg';


function Chat({ match, history }) {
	const [messages, setMessages] = useState([]);
	const inputRef = useRef(null);
	const {name} = match.params;
	
	const scrollToBottom = () => {
		inputRef.current.scrollIntoView({block: 'end'});
	};

	useEffect(scrollToBottom, [messages]);

	useEffect(() => {
		const list = [];
		JSON.parse(localStorage.getItem(name)).map((element) => {
			list.push(
				<div key={list.length} className={styles.message_container}>
					<div>{element[0]}</div>
					<div>{element[1]}</div>
				</div>,
			);
			return 0;
		});
		setMessages(list);
	}, [name]);

	function MessageInput() {
		const [currentMessage, setCurrentMessage] = useState('');
		const [attach, setAttach] = useState(false);
		const [preview, setPreview] = useState(false);
		const [attachments, setAttachments] = useState([]);
		const [audioToggle, setAudioToggle] = useState(false);
		const [recording, setRecording] = useState(false);
		const audioRef = useRef(null);
		const CurrMessageInput = useRef(null);
		const FileInputRef = useRef(null);

		const focusInput = () => {
			FileInputRef.current.click();
		};

		const previewFiles = (files) => {
			if (files.length > 10) {
				alert('There is a file limit of 10 maximum');
			} else {
				setPreview(true);
				const fileList = [];
				for (let i = 0; i < files.length; i+=1) {
					const fileURL = window.URL.createObjectURL(files[i]);
					fileList.push(
						<div key={i} className={styles.attach_container}>
							<img
								src={fileURL}
								alt="img"
								className={styles.attach_img}
								onLoad={() => {
									window.URL.revokeObjectURL(fileURL);
								}} />
						</div>
					);
				};
				setAttachments(fileList);
			}
		};

		const audio = <audio constrols ref={audioRef} src="" />;

		async function getMedia() {
			let stream = null;
			try {
				const constrains = { audio: true };
				stream = await navigator.mediaDevices.getUserMedia(constrains);
	
				const mediaRecorder = new MediaRecorder(stream);
				let chunks = [];
				mediaRecorder.addEventListener('stop', (event) => {
					const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
					chunks = [];
					const audioURL = URL.createObjectURL(blob);
					audioRef.src = audioURL;
				});
				mediaRecorder.addEventListener('dataavailable', (event) => {
					chunks.push(event.data);
				});
				
				return mediaRecorder;
			} catch(err) {
				console.log(err);
				return -1;
			}
		}

		const recordAudio = (recordingStatus) => {
			const record = getMedia();
			// if (recordingStatus) {
			// 	record.stop();
			// 	setRecording(false);
			// 	setAudioToggle(true);
			// } else {
			// 	record.start();
			// 	setRecording(true);
			// }
		};

		const attachMenu =
		<div className={styles.attach_menu}>
			<div className={styles.location} onClick={() => sendLocation()} role='button' tabIndex={0} onKeyPress={() => {}}>Location</div>
			<div className={styles.media} onClick={() => focusInput()} role='button' tabIndex={0} onKeyPress={() => {}}>Image</div>
			<input type="file" multiple accept="image/*" style={{'display': 'none'}} onChange={(event) => previewFiles(event.target.files)} ref={FileInputRef} />
			<div className={styles.audio} onClick={() => recordAudio(recording)} role='button' tabIndex={0} onKeyPress={() => {}}>
				Audio
				{recording ? <img src={stop} style={{'height': '1em'}} /> : <img src={play} style={{'height': '1em'}} />}
			</div>
		</div>;

		const attachmentList =
		<div className={styles.attachments_list}>
			{attachments}
		</div>;

		const sendLocation = () => {
			if ('geolocation' in navigator) {
				navigator.geolocation.getCurrentPosition((position) => {
					const pos = `https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`;
					setMessages([
						...messages,
						<div key={messages.length} className={styles.message_container}>
							<a href={pos}>{`Ваше местоположение: ${pos}`}</a>
						</div>
					]);
				});
			} else  {
				alert('Geolocation is not respond');
			}
		};

		const handleChange = (event) => {
			setCurrentMessage(event.target.value);
		};

		const inputFocus = () => {
			CurrMessageInput.current.focus();
		}; 

		const sendMessage = (event, value) => {
			event.preventDefault();
			if (value !== '') {
				const date = new Date();
				const data = JSON.parse(localStorage.getItem(name));
				let minutes = date.getMinutes().toString();
				if (minutes.length === 1) {
					minutes = `0${minutes}`;
				}
				let hours = date.getHours().toString();
				if (hours.length === 1) {
					hours = `0${hours}`;
				}
				setMessages([
					...messages,
					<div className={styles.message_container} key={data.length}>
						<div>{value}</div>
						<div>{`${hours}:${minutes}`}</div>
					</div>,
				]);

				data.push([value, `${hours}:${minutes}`]);
				localStorage.setItem(name, JSON.stringify(data));
			}
		};

		useEffect(inputFocus, [CurrMessageInput]);

		useEffect(() => console.log('rerender'));

		return (
			<form onSubmit={(event) => sendMessage(event, currentMessage.trim())}>
				{attach ? attachMenu : null}
				<div
					className={styles.input_form}
					onDragEnter={(event) => event.preventDefault()}
					onDragOver={(event) => event.preventDefault()}
					onDrop={(event) => {
						event.preventDefault();
						previewFiles(event.dataTransfer.files);
					}}
				>
					<img
						src={image}
						className={styles.attach_icon}
						onClick={() => setAttach(!attach)}
						alt="img"
					/>
					<input
						type="text"
						onChange={(event) => handleChange(event)}
						className={styles.message_input}
						ref={CurrMessageInput}
					/>
				</div>
				{preview ? attachmentList : null}
				{audioToggle ? audio: null}
			</form>
		);
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.chat_header}>
				<div role="button" tabIndex={0}
					className={styles.chat_exit_button}
					onKeyPress={() => {}}
					onClick={() => history.push('/')}
				>
					&#8678;
				</div>
				<div className={styles.chat_name}>{name}</div>
			</div>
			<div className={styles.messages_list} ref={inputRef}>{messages}</div>
			<MessageInput name={name} />
		</div>
	);
}

Chat.propTypes = {
	match: PropTypes.shape({
		params: PropTypes.shape({
			name: PropTypes.string.isRequired
		})
	}).isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default withRouter(Chat);
