import { addUserToList } from './addUserToList';
import { hideErrorMessage } from './hideErrorMessage'; 
import { initializeWebSocketConnection } from './ws';
import { setCurrentUserName } from './getName'; 

const baseURL = 'http://localhost:3000';

export async function checkNickname() {
    let currentUserName = null; 
    const nicknameInput = document.querySelector('.field-input-name');
    const nickname = nicknameInput.value.trim();
    const errorMessage = document.querySelector('.error-message');
    
    if (!nickname) {
        errorMessage.textContent = 'Пожалуйста, введите псевдоним';
        errorMessage.style.display = 'block';

        setTimeout(() => {
            document.addEventListener('click', hideErrorMessage);
        }, 0);

        return null;
    }

    document.removeEventListener('click', hideErrorMessage);

    try {
        const response = await fetch(`${baseURL}/new-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: nickname }),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.status === 'ok') {
                console.log('Никнейм зарегистрирован:', result.user.name);
                document.querySelector('.popup__choose-name').style.display = 'none';
                document.querySelector('.chat-widget').style.display = 'block';
                
                const usersList = document.querySelector('.users-list');
                usersList.innerHTML = ''; 
                addUserToList(result.user);

                currentUserName = result.user.name;

                setCurrentUserName(currentUserName);

                initializeWebSocketConnection(currentUserName);
                
                const usersElements = usersList.querySelectorAll('.user');
                usersElements.forEach(user => {
                    if (user.dataset.id === result.user.id) {
                        user.textContent = 'You';
                        user.classList.add('my-nickname');
                    }
                });

                nicknameInput.value = '';

                return currentUserName; 

            } else {
                throw new Error(result.message);
            }
        } else if (response.status === 409) {
            errorMessage.textContent = 'Этот псевдоним уже занят!';
            errorMessage.style.display = 'block';
            setTimeout(() => {
                document.addEventListener('click', hideErrorMessage);
            }, 0);
            nicknameInput.value = '';
        }

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }

    return null; 
}
