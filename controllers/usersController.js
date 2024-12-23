import multer from "multer";
import bcrypt from 'bcrypt';
import path from "path";
import { editProfile, getUserById, changePassword, getAllUsers, getProfileImageNameByUserId } from "../models/userModel.js";
import { DefaultProfileImageName } from "../config.js";
import { deleteImage } from "../utils/fileUtils.js";
const saltRounds = 10;

export const getUserProfileController = async (req, res) => {
    try{
        const userId = req.params.userId;
        const user = await getUserById(userId);

        res.status(200).json({
            message: "사용자 정보 조회 성공",
            data: {
                email: user.email,
                nickname: user.nickname,
                profileImage: user.profileImage || DefaultProfileImageName
            }
        });
    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


export const editProfileController = async(req, res) => {
    const userId = req.session.userId;
    const { isProfileImageChanged } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "로그인 필요" });
    }

    try{
        const previousImageName = await getProfileImageNameByUserId(userId);
        let profileImageName = previousImageName;

        // 프로필 이미지에 변경이 있었다면,
        if(isProfileImageChanged === 'true'){
            profileImageName = req.file ? req.file.filename : DefaultProfileImageName;

            // 기존 프로필 이미지 삭제
            if(previousImageName !== DefaultProfileImageName){
                const filePath = path.join(process.cwd(), 'uploads', previousImageName);
                deleteImage(filePath);
            }
        }

        const editedUserData = {
            nickname: req.body.nickname,
            profileImage: profileImageName
        }

        await editProfile(userId, editedUserData);

        res.status(200).json({message: "사용자 정보 수정 성공"});

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }

};


export const changePasswordController = async(req, res) => {
    const userId = req.session.userId;
    const newPassword = req.body.password;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    if(!userId){
        return res.status(401).json({message: "로그인 필요"});
    }

    try{
        const user = await getUserById(userId);
        const isPasswordSame = await bcrypt.compare(newPassword, user.password);
        
        if(isPasswordSame){
            res.status(400).json({message: "새 비밀번호는 기존 비밀번호와 같을 수 없습니다. 다시 입력해주세요."});
            return;
        }

        await changePassword(userId, hashedNewPassword);

        res.status(200).json({message: "비밀번호 변경 성공"});

    } catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
};


export const checkEmailController = async(req, res) => {
    const {email} = req.body;

    try{
        const users = await getAllUsers();
        const isDuplicate = users.some(user => user.email === email); // some() 배열 순회하며 조건에 맞는 요소가 하나라도 있으면 true 반환

        if(isDuplicate){
            res.status(200).json({ message: "이미 존재하는 이메일입니다.", isDuplicate: isDuplicate });
        }else{
            res.status(200).json({ message: "사용가능한 이메일입니다.", isDuplicate: isDuplicate });
        }
        

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}

export const checkNicknameController = async(req, res) => {
    const {nickname} = req.body;

    try{
        const users = await getAllUsers();
        let isDuplicate = users.some(user => user.nickname === nickname);

        // 닉네임에 변경이 없다면, 중복되지 않았다고 처리함. 
        if(req.session.userId){
            const userId = req.session.userId;
            const user = await getUserById(userId);
            if(user.nickname === nickname){
                isDuplicate = false;
            }
        }
        
        // 응답
        if(isDuplicate){
            res.status(200).json({ message: "이미 존재하는 닉네임입니다.", isDuplicate: isDuplicate });
        }else{
            res.status(200).json({ message: "사용가능한 닉네임입니다.", isDuplicate: isDuplicate });
        }

    }catch(error){
        console.log(error);
        res.status(500).json({message: "서버 에러 발생"});
    }
}

export const uploadProfileImageController = (req, res) => {
    upload.single('profile')

}

export const deleteAccountController = async(req, res) => {
    const userId = req.session.userId;

    if(!userId){
        return res.status(401).json({message: "로그인 필요"});
    }

    // 좋아요 삭제

    // 댓글 삭제

    // 게시물 삭제

    // 사용자 정보 삭제 (프로필 사진까지)

    // 로그아웃(세션 삭제)


    res.status(200).json({ message: "회원탈퇴 성공" });


}

